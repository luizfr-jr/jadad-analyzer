import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JADAD_USER_PROMPT } from '@/lib/jadad-prompt';
import { JadadAnalysis } from '@/types/jadad';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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
      model: 'gemini-2.0-flash',
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

    // Ensure total score is never negative
    analysis.totalScore = Math.max(0, analysis.totalScore);
    analysis.quality = analysis.totalScore >= 3 ? 'high' : 'low';
    analysis.qualityLabel =
      analysis.quality === 'high' ? 'Alta Qualidade Metodológica' : 'Baixa Qualidade Metodológica';

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
