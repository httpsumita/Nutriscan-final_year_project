import vision from "@google-cloud/vision"

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY_PATH
})

interface ProductInfo {
  productName: string
  ingredients: string[]
  nutrition: Record<string, any>
  allergens: string[]
}

/**
 * Extract text from product image using Google Cloud Vision OCR (free tier)
 * Free tier includes 1,000 text detection requests per month
 */
export async function extractProductTextFromImage(imageData: string | Buffer): Promise<ProductInfo> {
  try {
    let request: any

    if (typeof imageData === "string" && imageData.startsWith("data:image")) {
      // Base64 data URL
      const base64 = imageData.split(",")[1]
      request = {
        image: {
          content: base64
        }
      }
    } else if (typeof imageData === "string") {
      // Base64 string
      request = {
        image: {
          content: imageData
        }
      }
    } else {
      // Buffer
      request = {
        image: {
          content: imageData
        }
      }
    }

    // Use TEXT_DETECTION for free tier (1000 requests/month)
    const [result] = await client.textDetection(request)
    const detections = result.textAnnotations

    if (!detections || detections.length === 0) {
      return {
        productName: "unknown",
        ingredients: [],
        nutrition: {},
        allergens: []
      }
    }

    // First annotation contains all text
    const fullText = detections[0].description || ""

    // Parse the extracted text
    return parseProductText(fullText)
  } catch (error) {
    console.error("Vision API error:", error)
    return {
      productName: "unknown",
      ingredients: [],
      nutrition: {},
      allergens: []
    }
  }
}

/**
 * Parse extracted product text to extract ingredients, nutrition, and allergens
 */
function parseProductText(text: string): ProductInfo {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0)

  let productName = "unknown"
  const ingredients: string[] = []
  const nutrition: Record<string, any> = {}
  const allergens: string[] = []

  let section = "general"

  const commonAllergens = ["milk", "eggs", "peanuts", "tree nuts", "fish", "shellfish", "soy", "wheat", "sesame"]

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Detect sections
    if (lowerLine.includes("ingredient") || lowerLine.includes("contains")) {
      section = "ingredients"
      continue
    }
    if (lowerLine.includes("nutrition") || lowerLine.includes("nutrition facts")) {
      section = "nutrition"
      continue
    }
    if (lowerLine.includes("allergen") || lowerLine.includes("allergy") || lowerLine.includes("may contain")) {
      section = "allergens"
      continue
    }

    // Parse based on section
    if (section === "general" && !productName.includes("unknown")) {
      productName = line
    } else if (section === "ingredients") {
      // Clean up ingredient line
      if (line && !line.match(/^\d+/)) {
        ingredients.push(line.replace(/,\s*$/, ""))
      }
    } else if (section === "nutrition") {
      // Try to parse nutrition facts
      const match = line.match(/([a-zA-Z\s]+)[\s:]*(\d+\.?\d*)\s*(g|mg|kcal|%)?/)
      if (match) {
        const nutrient = match[1].trim()
        const value = parseFloat(match[2])
        const unit = match[3] || "g"
        nutrition[nutrient.toLowerCase()] = { value, unit }
      }
    } else if (section === "allergens") {
      // Check for common allergens
      for (const allergen of commonAllergens) {
        if (lowerLine.includes(allergen) && !allergens.includes(allergen)) {
          allergens.push(allergen)
        }
      }
    }
  }

  return {
    productName: productName || "unknown",
    ingredients: ingredients.filter(ing => ing.length > 0),
    nutrition,
    allergens
  }
}
