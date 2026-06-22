import { GoogleGenerativeAI } from '@google/generative-ai'

interface ProductInfo {
  productName: string
  ingredients: string[]
  nutrition: Record<string, any>
  allergens: string[]
}

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Extract text from product image using Gemini Vision API
 */
export async function extractProductTextFromImage(
  imageData: string | Buffer
): Promise<ProductInfo> {
  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Convert Buffer to base64 if needed
    let base64Data = typeof imageData === 'string' ? imageData : imageData.toString('base64')

    // Remove data URL prefix if present
    if (base64Data.startsWith('data:image')) {
      base64Data = base64Data.split(',')[1]
    }

    const prompt = `Analyze this food product image and extract the following information. Return ONLY valid JSON with no additional text:
{
  "productName": "exact product name",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number, "sugar": number, "fiber": number },
  "allergens": ["allergen1", "allergen2", ...]
}

Extract from visible labels. If values aren't visible, set to 0 for numbers, empty array for lists, or "Unknown" for product name.
IMPORTANT: Return only the JSON object, no markdown, no code blocks, no explanation.`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
      prompt,
    ])

    const responseText = result.response.text()

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        productName: parsed.productName || 'Unknown Product',
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
        nutrition: typeof parsed.nutrition === 'object' ? parsed.nutrition : {},
        allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
      }
    }

    return {
      productName: 'Unknown Product',
      ingredients: [],
      nutrition: {},
      allergens: [],
    }
  } catch (error) {
    console.error('Vision API error:', error)
    return {
      productName: 'Unknown Product',
      ingredients: [],
      nutrition: {},
      allergens: [],
    }
  }
}
