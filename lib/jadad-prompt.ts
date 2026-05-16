export const JADAD_SYSTEM_PROMPT = `Você é um especialista em metodologia de pesquisa clínica, com profundo conhecimento na Escala de Jadad para avaliação da qualidade metodológica de ensaios clínicos randomizados (ECR).

Sua tarefa é analisar artigos científicos e aplicar rigorosamente a Escala de Jadad, avaliando cada critério com base no conteúdo do artigo fornecido.

Responda SEMPRE em português brasileiro e retorne EXCLUSIVAMENTE um JSON válido, sem texto adicional.`;

export const JADAD_USER_PROMPT = `Analise este artigo científico aplicando a Escala de Jadad para avaliação da qualidade metodológica de ensaios clínicos randomizados.

## ESCALA DE JADAD — CRITÉRIOS DE AVALIAÇÃO

A Escala de Jadad avalia 3 domínios com 5 questões, com pontuação máxima de 5 pontos.

### DOMÍNIO 1 — RANDOMIZAÇÃO (0–2 pontos)

**Questão 1:** O estudo foi descrito como randomizado (alocação aleatória dos participantes)?
- SIM = +1 ponto | NÃO = 0 pontos

**Questão 2:** O método de randomização foi descrito E é adequado?
- SIM, método descrito e ADEQUADO (ex: sequência gerada por computador, tabela de números aleatórios, randomização em blocos) = +1 ponto adicional
- SIM, método descrito mas INADEQUADO (ex: alternância, data de nascimento, número do prontuário, dia da semana) = -1 ponto
- NÃO descrito = 0 pontos

### DOMÍNIO 2 — CEGAMENTO (0–2 pontos)

**Questão 3:** O estudo foi descrito como duplo-cego?
- SIM = +1 ponto | NÃO = 0 pontos

**Questão 4:** O método de cegamento foi descrito E é adequado?
- SIM, método descrito e ADEQUADO (ex: placebos idênticos, veículos idênticos, mascaramento de rótulos) = +1 ponto adicional
- SIM, método descrito mas INADEQUADO = -1 ponto
- NÃO descrito = 0 pontos

### DOMÍNIO 3 — PERDAS E RETIRADAS (0–1 ponto)

**Questão 5:** Houve descrição das perdas e retiradas do estudo?
- SIM (número e motivos das retiradas em cada grupo, ou afirmação explícita de que não houve retiradas) = +1 ponto
- NÃO = 0 pontos

### INTERPRETAÇÃO
- 0–2 pontos: BAIXA qualidade metodológica
- 3–5 pontos: ALTA qualidade metodológica

---

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):

{
  "articleTitle": "título completo do artigo",
  "articleAuthors": "lista de autores como aparecem no artigo",
  "articleYear": "ano de publicação",
  "articleJournal": "nome do periódico/revista",
  "articleDOI": "DOI se disponível, ou string vazia",
  "items": [
    {
      "id": 1,
      "domain": "Randomização",
      "question": "O estudo foi descrito como randomizado?",
      "score": 1,
      "justification": "justificativa detalhada baseada no conteúdo do artigo, citando trechos relevantes"
    },
    {
      "id": 2,
      "domain": "Randomização",
      "question": "O método de randomização foi descrito e é adequado?",
      "score": 0,
      "justification": "justificativa detalhada"
    },
    {
      "id": 3,
      "domain": "Cegamento",
      "question": "O estudo foi descrito como duplo-cego?",
      "score": 0,
      "justification": "justificativa detalhada"
    },
    {
      "id": 4,
      "domain": "Cegamento",
      "question": "O método de cegamento foi descrito e é adequado?",
      "score": 0,
      "justification": "justificativa detalhada"
    },
    {
      "id": 5,
      "domain": "Perdas e Retiradas",
      "question": "Houve descrição das perdas e retiradas do estudo?",
      "score": 0,
      "justification": "justificativa detalhada"
    }
  ],
  "totalScore": 1,
  "quality": "low",
  "qualityLabel": "Baixa Qualidade Metodológica",
  "summary": "resumo geral da qualidade metodológica do estudo em 2–3 frases, em português"
}

ATENÇÃO:
- A pontuação total mínima é 0 (não pode ser negativa)
- A pontuação das questões 2 e 4 pode ser -1, 0 ou 1
- As questões 1, 3 e 5 só podem ser 0 ou 1
- Se quality = "low" use qualityLabel = "Baixa Qualidade Metodológica"
- Se quality = "high" use qualityLabel = "Alta Qualidade Metodológica"`;
