import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JADAD_USER_PROMPT } from '@/lib/jadad-prompt';
import { JadadAnalysis } from '@/types/jadad';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY não configurada nas variáveis de ambiente.');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos.' }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'O arquivo PDF não pode ultrapassar 20MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-8b',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: 'application/pdf',
        },
      },
      JADAD_USER_PROMPT,
    ]);

    const raw = result.response.text().trim();
    const analysis: JadadAnalysis = JSON.parse(raw);

    analysis.totalScore = Math.max(0, analysis.totalScore);
    analysis.quality = analysis.totalScore >= 3 ? 'high' : 'low';
    analysis.qualityLabel =
      analysis.quality === 'high' ? 'Alta Qualidade Metodológica' : 'Baixa Qualidade Metodológica';

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);

    let message = 'Erro interno do servidor.';

    if (err instanceof Error) {
      if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Quota')) {
        message =
          'Cota da API do Google esgotada. Verifique se a chave foi criada em aistudio.google.com (não no Google Cloud Console) e aguarde alguns minutos antes de tentar novamente.';
      } else if (err.message.includes('API_KEY') || err.message.includes('API key')) {
        message =
          'Chave de API inválida ou não configurada. Verifique a variável GOOGLE_API_KEY no Vercel.';
      } else if (err.message.includes('GOOGLE_API_KEY')) {
        message = 'Variável GOOGLE_API_KEY não configurada no servidor. Configure-a nas variáveis de ambiente do Vercel.';
      } else {
        message = err.message;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
