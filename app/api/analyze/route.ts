import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { JADAD_USER_PROMPT } from '@/lib/jadad-prompt';
import { JadadAnalysis } from '@/types/jadad';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY não configurada nas variáveis de ambiente.');
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: 'application/pdf',
              },
            },
            { text: JADAD_USER_PROMPT },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const raw = (response.text ?? '').trim();
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
      if (err.message.includes('429') || err.message.toLowerCase().includes('quota')) {
        message = 'Cota da API do Google esgotada. Certifique-se de que a chave foi criada em aistudio.google.com e aguarde alguns minutos.';
      } else if (err.message.toLowerCase().includes('api key') || err.message.includes('403')) {
        message = 'Chave de API inválida. Verifique a variável GOOGLE_API_KEY no Vercel.';
      } else if (err.message.includes('404')) {
        message = 'Modelo não encontrado. Verifique se a chave de API tem acesso ao Gemini.';
      } else {
        message = err.message;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
