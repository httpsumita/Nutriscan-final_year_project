import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' })
  
  const result = await model.embedContent(text)
  // Convert to number array if needed
  const embedding = result.embedding
  if (Array.isArray(embedding.values)) {
    return embedding.values as number[]
  }
  return []
}

export async function storeResearchDoc(
  condition: string,
  content: string,
  source?: string
): Promise<any> {
  const embedding = JSON.stringify(await embedText(content))

  return await prisma.researchDoc.create({
    data: {
      condition,
      content,
      source: source || 'manual',
      embedding
    }
  })
}

export async function queryResearchDocs(
  conditions: string[],
  query: string,
  limit = 3
): Promise<any[]> {
  // Simple retrieval: for production, use pgvector similarity search
  // For now, fetch top docs by condition match
  const docs = await prisma.researchDoc.findMany({
    where: {
      condition: {
        in: conditions.length > 0 ? conditions : undefined
      }
    },
    take: limit
  })

  return docs
}

export async function generateRAGResponse(
  query: string,
  researchDocs: any[],
  userProfile: { conditions: string[]; goals: string[] }
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const context = researchDocs
    .map(doc => `[${doc.source}] ${doc.content}`)
    .join('\n\n')

  const prompt = `
Based on the following research context, answer the user's question considering their health profile.

User Conditions: ${userProfile.conditions.join(', ')}
User Goals: ${userProfile.goals.join(', ')}

Research Context:
${context}

Question: ${query}

Provide evidence-based guidance with citations where applicable.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function seedResearchDocs() {
  // Seed some sample research docs
  const samples = [
    {
      condition: 'PCOS',
      source: 'pubmed',
      content:
        'PCOS (Polycystic Ovary Syndrome) requires careful nutrition management. Studies show that low-glycemic index foods reduce insulin spikes, key to PCOS management. Limit refined carbohydrates and focus on whole grains, lean proteins, and healthy fats. Regular physical activity improves insulin sensitivity.'
    },
    {
      condition: 'Insulin resistance',
      source: 'pubmed',
      content:
        'Insulin resistance is improved by dietary choices rich in fiber, omega-3 fatty acids, and chromium. Avoid high-fructose corn syrup and processed foods. Mediterranean diet patterns show strong evidence for improving insulin sensitivity in clinical trials.'
    },
    {
      condition: 'Thyroid',
      source: 'openfda',
      content:
        'Thyroid health depends on adequate iodine, selenium, and zinc. Avoid excessive soy products if you have hypothyroidism. Gluten sensitivity is common in autoimmune thyroid disease, so consider testing. Maintain stable cortisol with adequate sleep and stress management.'
    }
  ]

  for (const sample of samples) {
    const existing = await prisma.researchDoc.findFirst({
      where: { condition: sample.condition, source: sample.source }
    })

    if (!existing) {
      await storeResearchDoc(sample.condition, sample.content, sample.source)
    }
  }
}
