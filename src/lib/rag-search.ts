import { search } from 'duckduckgo-search'
import fs from 'fs'
import path from 'path'

export interface FoodDbEntry {
  id: number
  name: string
  name_scientific: string
  description: string
  food_group: string
  food_subgroup: string
  picture_file_name: string
}

export interface RagContext {
  foodDbMatches: FoodDbEntry[]
  webSearchResults: any[]
  combinedNutritionInfo: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    ingredients?: string[]
    allergens?: string[]
    chemicals?: string[]
    [key: string]: any
  }
}

/**
 * Search Food.json database for ingredient matches using simple string matching
 */
export async function searchFoodDatabase(ingredients: string[]): Promise<FoodDbEntry[]> {
  try {
    const foodDbPath = path.join(process.cwd(), 'food_db', 'foodb_2020_04_07_json', 'Food.json')

    // Check if file exists
    if (!fs.existsSync(foodDbPath)) {
      console.warn('Food.json database not found at', foodDbPath)
      return []
    }

    const fileContent = fs.readFileSync(foodDbPath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim())

    const matches: FoodDbEntry[] = []
    const seenIds = new Set<number>()

    // Search for ingredient matches
    for (const ingredient of ingredients) {
      const searchTerm = ingredient.toLowerCase()

      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as FoodDbEntry

          // Avoid duplicates
          if (seenIds.has(entry.id)) continue

          // Match by name or food group/subgroup
          if (
            entry.name.toLowerCase().includes(searchTerm) ||
            entry.name_scientific.toLowerCase().includes(searchTerm) ||
            entry.food_group.toLowerCase().includes(searchTerm) ||
            entry.food_subgroup.toLowerCase().includes(searchTerm) ||
            entry.description.toLowerCase().includes(searchTerm)
          ) {
            matches.push(entry)
            seenIds.add(entry.id)
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

    return matches.slice(0, 10) // Limit to 10 results
  } catch (error) {
    console.error('Error searching food database:', error)
    return []
  }
}

/**
 * Search DuckDuckGo for nutritional information about ingredients
 */
export async function searchNutritionInfo(ingredient: string): Promise<any[]> {
  try {
    const query = `${ingredient} nutrition facts calories protein carbs fat`

    // Use duckduckgo instant answer API (free, no API key required)
    const results = await search({
      query,
      max_results: 3
    })

    return results || []
  } catch (error) {
    console.error('Error searching nutrition info:', error)
    return []
  }
}

/**
 * Build RAG context by combining Food.json matches and web search results
 */
export async function buildRagContext(ingredients: string[]): Promise<RagContext> {
  // Search Food.json database
  const foodDbMatches = await searchFoodDatabase(ingredients)

  // Search web for nutrition info on primary ingredients
  const primaryIngredients = ingredients.slice(0, 3) // Search top 3 ingredients
  const webSearchResults: any[] = []

  for (const ingredient of primaryIngredients) {
    const results = await searchNutritionInfo(ingredient)
    webSearchResults.push(...results)
  }

  // Parse and combine nutritional information
  const combinedNutritionInfo = parseNutritionInfo(foodDbMatches, webSearchResults)

  return {
    foodDbMatches,
    webSearchResults,
    combinedNutritionInfo
  }
}

/**
 * Parse and combine nutritional data from Food.json and web searches
 */
function parseNutritionInfo(foodDbMatches: FoodDbEntry[], webResults: any[]): RagContext['combinedNutritionInfo'] {
  const nutrition: RagContext['combinedNutritionInfo'] = {
    ingredients: [],
    allergens: [],
    chemicals: []
  }

  // Extract from Food.json descriptions
  for (const food of foodDbMatches) {
    // Extract nutrients mentioned in description
    const description = food.description.toLowerCase()

    if (description.includes('calorie')) nutrition.calories = true as any
    if (description.includes('protein')) nutrition.protein = true as any
    if (description.includes('fiber')) nutrition.fiber = true as any
    if (description.includes('vitamin')) nutrition.vitamins = true as any

    // Track allergen keywords
    const allergens = ['milk', 'eggs', 'peanuts', 'tree nuts', 'fish', 'shellfish', 'soy', 'wheat', 'sesame']
    for (const allergen of allergens) {
      if (description.includes(allergen)) {
        nutrition.allergens?.push(allergen)
      }
    }

    nutrition.ingredients?.push(food.name)
  }

  // Parse web results for additional nutrition data
  for (const result of webResults) {
    if (result.body) {
      const body = result.body.toLowerCase()

      // Try to extract calorie info
      const calorieMatch = body.match(/(\d+)\s*(?:kcal|calories|cal)/i)
      if (calorieMatch && !nutrition.calories) {
        nutrition.calories = parseInt(calorieMatch[1])
      }

      // Extract macro info
      if (body.includes('protein')) nutrition.protein = true as any
      if (body.includes('carb')) nutrition.carbs = true as any
      if (body.includes('fat')) nutrition.fat = true as any
      if (body.includes('fiber')) nutrition.fiber = true as any
    }
  }

  return nutrition
}

/**
 * Extract relevant RAG context for LLM prompt
 */
export function formatRagContextForPrompt(context: RagContext): string {
  let prompt = ''

  if (context.foodDbMatches.length > 0) {
    prompt += 'Food Database Matches:\n'
    for (const food of context.foodDbMatches) {
      prompt += `- ${food.name} (${food.food_group}): ${food.description.substring(0, 100)}...\n`
    }
    prompt += '\n'
  }

  if (context.combinedNutritionInfo) {
    prompt += 'Nutritional Information:\n'
    prompt += `- Ingredients: ${context.combinedNutritionInfo.ingredients?.join(', ') || 'N/A'}\n`
    prompt += `- Allergens: ${context.combinedNutritionInfo.allergens?.length ? context.combinedNutritionInfo.allergens.join(', ') : 'None detected'}\n`

    if (context.combinedNutritionInfo.calories) {
      prompt += `- Calories: ${context.combinedNutritionInfo.calories} per serving\n`
    }

    prompt += '\n'
  }

  return prompt
}
