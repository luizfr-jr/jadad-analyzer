/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JadadAnalysis } from '@/types/jadad';

const G_DARK   = [22, 101, 52]   as [number, number, number];
const G_MID    = [21, 128, 61]   as [number, number, number];
const G_LIGHT  = [220, 252, 231] as [number, number, number];
const G_BORDER = [134, 239, 172] as [number, number, number];
const WHITE    = [255, 255, 255] as [number, number, number];
const GRAY_T   = [75, 85, 99]    as [number, number, number];
const GRAY_L   = [243, 244, 246] as [number, number, number];

function setFill(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setDraw(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }
function setTxt(doc: jsPDF, c: [number, number, number])  { doc.setTextColor(c[0], c[1], c[2]); }

function addHeader(doc: jsPDF, title: string) {
  setFill(doc, G_DARK);
  doc.rect(0, 0, 210, 28, 'F');
  setTxt(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Analisador Jadad — Ferramenta de Avaliação Metodológica', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(title, 14, 20);
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = 290;
  setDraw(doc, G_MID);
  doc.setLineWidth(0.3);
  doc.line(14, y - 3, 196, y - 3);
  setTxt(doc, GRAY_T);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Jadad AR et al. Control Clin Trials. 1996;17(1):1-12. | Gerado pela Ferramenta de Análise Jadad', 14, y + 2);
  doc.text(`Página ${pageNum} de ${totalPages}`, 196, y + 2, { align: 'right' });
}

// Shorthand for autoTable color values
const tHead = { fillColor: G_DARK as any, textColor: WHITE as any, fontStyle: 'bold' as const };
const tAlt  = { fillColor: GRAY_L as any };
const tBody = { textColor: GRAY_T as any };

export function generateJadadPDF(analysis: JadadAnalysis): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── PAGE 1: Cover ─────────────────────────────────────────────────────────
  setFill(doc, G_DARK);
  doc.rect(0, 0, 210, 297, 'F');

  setFill(doc, G_MID);
  doc.circle(105, 70, 35, 'F');
  setTxt(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('J', 105, 76, { align: 'center' });

  doc.setFontSize(22);
  doc.text('Analisador Jadad', 105, 110, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('Avaliação da Qualidade Metodológica de', 105, 122, { align: 'center' });
  doc.text('Ensaios Clínicos Randomizados', 105, 130, { align: 'center' });

  setFill(doc, G_MID);
  doc.roundedRect(30, 145, 150, 55, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTxt(doc, G_LIGHT);
  doc.text('ARTIGO ANALISADO', 105, 155, { align: 'center' });
  setTxt(doc, WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const titleLinesC = doc.splitTextToSize(analysis.articleTitle, 136);
  doc.text(titleLinesC.slice(0, 3), 105, 163, { align: 'center' });
  doc.setFontSize(8);
  setTxt(doc, G_LIGHT);
  doc.text(analysis.articleAuthors.substring(0, 80) + (analysis.articleAuthors.length > 80 ? '…' : ''), 105, 183, { align: 'center' });
  doc.text(`${analysis.articleJournal} • ${analysis.articleYear}`, 105, 190, { align: 'center' });

  const scoreCircleColor: [number, number, number] = analysis.quality === 'high' ? [134, 239, 172] : [252, 165, 165];
  doc.setFillColor(scoreCircleColor[0], scoreCircleColor[1], scoreCircleColor[2]);
  doc.circle(105, 228, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  setTxt(doc, G_DARK);
  doc.text(String(analysis.totalScore), 105, 234, { align: 'center' });
  doc.setFontSize(9);
  doc.text('/5', 105, 241, { align: 'center' });

  setTxt(doc, WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(analysis.qualityLabel, 105, 260, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Data da análise: ${today}`, 105, 270, { align: 'center' });

  // ── PAGE 2: Methodology ──────────────────────────────────────────────────
  doc.addPage();
  addHeader(doc, 'Fundamentação Metodológica — Escala de Jadad');
  let y = 38;

  setTxt(doc, G_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Escala de Jadad: Origem e Fundamentação', 14, y);
  y += 8;

  setTxt(doc, GRAY_T);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const methodText =
    'A Escala de Jadad foi desenvolvida em 1996 por pesquisadores da Universidade de Oxford ' +
    'com o objetivo de avaliar a qualidade metodológica de ensaios clínicos randomizados (ECR). ' +
    'Trata-se de um instrumento amplamente utilizado em revisões sistemáticas e meta-análises ' +
    'para identificar estudos com risco de viés metodológico.\n\n' +
    'A escala avalia três domínios críticos: randomização, cegamento e documentação de perdas e ' +
    'retiradas. Cada domínio recebe pontuação específica, resultando em pontuação total de 0 a 5 pontos.';
  const methodLines = doc.splitTextToSize(methodText, 182);
  doc.text(methodLines, 14, y);
  y += methodLines.length * 5 + 6;

  setFill(doc, G_LIGHT);
  setDraw(doc, G_BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  setTxt(doc, G_DARK);
  doc.text('Referência Original:', 19, y + 7);
  doc.setFont('helvetica', 'normal');
  setTxt(doc, GRAY_T);
  doc.setFontSize(8.5);
  doc.text('Jadad AR, Moore RA, Carroll D, Jenkinson C, Reynolds DJ, Gavaghan DJ, McQuay HJ.', 19, y + 13);
  doc.text('Assessing the quality of reports of randomized clinical trials: is blinding necessary? Control Clin Trials. 1996;17(1):1-12.', 19, y + 19);
  y += 30;

  setTxt(doc, G_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Critérios de Avaliação da Escala de Jadad', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Domínio', 'Questão', 'Pontuação']],
    body: [
      ['Randomização\n(0–2 pts)', 'Q1: O estudo foi descrito como randomizado?', 'Sim = +1 | Não = 0'],
      ['', 'Q2: O método de randomização foi descrito e é adequado?\n• Adequado (computador, tabela aleatória) = +1\n• Inadequado (alternância, data de nascimento) = -1\n• Não descrito = 0', '+1 / 0 / -1'],
      ['Cegamento\n(0–2 pts)', 'Q3: O estudo foi descrito como duplo-cego?', 'Sim = +1 | Não = 0'],
      ['', 'Q4: O método de cegamento foi descrito e é adequado?\n• Adequado (placebos idênticos) = +1\n• Inadequado = -1\n• Não descrito = 0', '+1 / 0 / -1'],
      ['Perdas e Retiradas\n(0–1 pt)', 'Q5: Houve descrição das perdas e retiradas?\n(número e motivos por grupo, ou afirmação de ausência)', 'Sim = +1 | Não = 0'],
    ],
    styles: { fontSize: 8, cellPadding: 3, ...tBody },
    headStyles: { ...tHead, fontSize: 9 },
    alternateRowStyles: tAlt,
    columnStyles: { 0: { cellWidth: 32, fontStyle: 'bold' }, 1: { cellWidth: 118 }, 2: { cellWidth: 32, halign: 'center' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  setTxt(doc, G_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Interpretação da Pontuação', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Pontuação Total', 'Classificação', 'Interpretação']],
    body: [
      ['0 – 2 pontos', 'Baixa Qualidade', 'Estudo com risco elevado de viés metodológico. Resultados devem ser interpretados com cautela.'],
      ['3 – 5 pontos', 'Alta Qualidade', 'Estudo com qualidade metodológica adequada. Menor risco de viés nos resultados reportados.'],
    ],
    styles: { fontSize: 8.5, cellPadding: 3.5, ...tBody },
    headStyles: tHead,
    columnStyles: { 0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 40, halign: 'center' }, 2: { cellWidth: 107 } },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc, 2, 3);

  // ── PAGE 3: Results ───────────────────────────────────────────────────────
  doc.addPage();
  addHeader(doc, 'Resultado da Análise');
  y = 38;

  setFill(doc, G_LIGHT);
  setDraw(doc, G_BORDER);
  doc.roundedRect(14, y, 182, 38, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTxt(doc, G_DARK);
  doc.text('ARTIGO ANALISADO', 19, y + 7);
  doc.setFont('helvetica', 'normal');
  setTxt(doc, GRAY_T);
  doc.setFontSize(8.5);
  const aTitleLines = doc.splitTextToSize(analysis.articleTitle, 170);
  doc.text(aTitleLines.slice(0, 2), 19, y + 14);
  doc.setFont('helvetica', 'italic');
  doc.text(analysis.articleAuthors.substring(0, 100) + (analysis.articleAuthors.length > 100 ? '…' : ''), 19, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysis.articleJournal} | ${analysis.articleYear}${analysis.articleDOI ? ' | DOI: ' + analysis.articleDOI : ''}`, 19, y + 31);
  y += 46;

  setTxt(doc, G_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Resultado da Escala de Jadad', 14, y);
  y += 6;

  const domainScores = [
    { label: 'Randomização',     score: Math.max(0, analysis.items[0].score + analysis.items[1].score), max: 2 },
    { label: 'Cegamento',        score: Math.max(0, analysis.items[2].score + analysis.items[3].score), max: 2 },
    { label: 'Perdas e Retiradas', score: analysis.items[4].score, max: 1 },
  ];

  autoTable(doc, {
    startY: y,
    head: [['Domínio', 'Pontuação Obtida', 'Pontuação Máxima']],
    body: [
      ...domainScores.map((s) => [s.label, String(s.score), String(s.max)]),
      ['TOTAL', String(analysis.totalScore), '5'],
    ],
    styles: { fontSize: 9, cellPadding: 3.5, ...tBody, halign: 'center' },
    headStyles: tHead,
    bodyStyles: { halign: 'center' },
    columnStyles: { 0: { halign: 'left', cellWidth: 80 }, 1: { cellWidth: 53 }, 2: { cellWidth: 49 } },
    didParseCell: (data) => {
      if (data.row.index === domainScores.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = G_LIGHT as any;
        data.cell.styles.textColor = G_DARK as any;
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  setTxt(doc, G_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Checklist Detalhado', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Domínio', 'Questão', 'Pt.', 'Justificativa']],
    body: analysis.items.map((item) => [
      String(item.id),
      item.domain,
      item.question,
      item.score > 0 ? `+${item.score}` : String(item.score),
      item.justification,
    ]),
    styles: { fontSize: 7.5, cellPadding: 2.5, ...tBody, valign: 'top' },
    headStyles: { ...tHead, fontSize: 8 },
    alternateRowStyles: tAlt,
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 52 },
      3: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 82 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const val = Number(data.cell.text[0]);
        if (val > 0) data.cell.styles.textColor = G_MID as any;
        if (val < 0) data.cell.styles.textColor = [220, 38, 38] as any;
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  if (y < 260) {
    const summaryLines = doc.splitTextToSize(analysis.summary, 172);
    const boxH = summaryLines.length * 5 + 14;
    setFill(doc, G_LIGHT);
    setDraw(doc, G_BORDER);
    doc.roundedRect(14, y, 182, boxH, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTxt(doc, G_DARK);
    doc.text('Conclusão da Análise:', 19, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setTxt(doc, GRAY_T);
    doc.text(summaryLines, 19, y + 15);
  }

  addFooter(doc, 3, 3);

  const safeTitle = analysis.articleTitle.replace(/[^a-zA-Z0-9À-ɏ]/g, '_').slice(0, 40);
  doc.save(`Jadad_${safeTitle}_${new Date().getFullYear()}.pdf`);
}
