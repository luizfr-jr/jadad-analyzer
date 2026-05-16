import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { JADAD_SYSTEM_PROMPT, JADAD_USER_PROMPT } from '@/lib/jadad-prompt';
import { JadadAnalysis } from '@/types/jadad';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: 'O arquivo PDF não pode ultrapassar 32MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: JADAD_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            } as Anthropic.DocumentBlockParam,
            {
              type: 'text',
              text: JADAD_USER_PROMPT,
            },
          ],
        },
      ],
      stream: false,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Resposta inesperada da API.');
    }

    let raw = content.text.trim();
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) raw = fenceMatch[1].trim();

    const analysis: JadadAnalysis = JSON.parse(raw);

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
