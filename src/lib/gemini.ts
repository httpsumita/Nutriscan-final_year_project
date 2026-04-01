import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function analyzeProductImage(imageData: string | Buffer) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `Analyze this food product image and extract:
1. Product name
2. List of ingredients
3. Nutrition facts (if visible)
4. Any allergens

Return as JSON with keys: productName, ingredients (array), nutrition (object), allergens (array).`

  let content

  if (typeof imageData === "string") {
    // Assume base64 or URL
    if (imageData.startsWith("http")) {
      content = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData
          }
        },
        prompt
      ]
    } else {
      // Base64
      content = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData
          }
        },
        prompt
      ]
    }
  } else {
    // Buffer
    const base64 = imageData.toString("base64")
    content = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64
        }
      },
      prompt
    ]
  }

  const result = await model.generateContent(content as any)
  const response = await result.response
  const text = response.text()

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return { productName: "unknown", ingredients: [], nutrition: {}, allergens: [] }
}

export async function generatePersonalizedAnalysis(
  productName: string,
  ingredients: string[],
  userProfile: { conditions: string[]; goals: string[] },
  researchContext?: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `
You are a personalized nutritional health AI. Analyze this product for a user with the given health profile.

Product: ${productName}
Ingredients: ${ingredients.join(", ")}
User Conditions: ${userProfile.conditions.join(", ")}
User Goals: ${userProfile.goals.join(", ")}

${researchContext ? `Research Context: ${researchContext}` : ""}

Provide:
1. Overall compatibility score (0-100)
2. Ingredient-by-ingredient risk assessment
3. Personalized explanation focusing on their health conditions
4. Recommendations (serving size, consumption frequency)
5. Citations/references if applicable

Return as JSON.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return {
    score: 50,
    explanation: "Unable to analyze at this time",
    recommendations: []
  }
}
