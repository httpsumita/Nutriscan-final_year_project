import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLM_CONFIG } from './types'

export interface FoodDbEntry {
  id: number
  name: string
  name_scientific: string
  description: string
  food_group: string
  food_subgroup: string
  picture_file_name: string
}

export interface AnalysisOption {
  option: '1' | '2'
  title: string
  source: string
  ingredients: string[]
  analysis: string
  healthImpact: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  recommendation: string
  score: number
}

export interface RagContext {
  foodDbMatches: FoodDbEntry[]
  analysisOptions: AnalysisOption[]
  combinedNutritionInfo: Record<string, any>
}

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Search Food.json database for ingredient matches using simple string matching
 */
export async function searchFoodDatabase(ingredients: string[]): Promise<FoodDbEntry[]> {
  try {
    const foodDbPath = path.join(
      process.cwd(),
      'food_db',
      'foodb_2020_04_07_json',
      'Food.json'
    )

    // Check if file exists
    if (!fs.existsSync(foodDbPath)) {
      console.warn('Food.json database not found at', foodDbPath)
      return []
    }

    const fileContent = fs.readFileSync(foodDbPath, 'utf-8')
    const lines = fileContent.split('\n').filter((line) => line.trim())

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

    return matches.slice(0, 10)
  } catch (error) {
    console.error('Error searching food database:', error)
    return []
  }
}

/**
 * Search DuckDuckGo for nutritional information about ingredients
 */
export async function searchDuckDuckGo(
  ingredient: string
): Promise<string> {
  try {
    // Using DuckDuckGo API endpoint without the search function
    const query = encodeURIComponent(
      `${ingredient} nutrition facts health effects on human body`
    )
    const url = `https://api.duckduckgo.com/?q=${query}&format=json`

    const response = await fetch(url)
    const data = await response.json()

    // Extract relevant information from the response
    let result = `Search results for ${ingredient}:\n`

    if (data.AbstractText) {
      result += `Summary: ${data.AbstractText}\n`
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      result += 'Related information:\n'
      data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
        if (topic.Text) {
          result += `- ${topic.Text}\n`
        }
      })
    }

    return result
  } catch (error) {
    console.error(`Error searching DuckDuckGo for ${ingredient}:`, error)
    return `Unable to fetch information about ${ingredient}`
  }
}

/**
 * Parse JSON from response text, handling markdown formatting
 */
function parseJsonResponse(text: string): any {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  
  // Try to find JSON object - be more flexible with regex
  const jsonMatch = cleaned.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/)
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error('Failed to parse JSON:', jsonMatch[0], e)
      return null
    }
  }
  
  return null
}

/**
 * Analyze ingredients using Gemini with Food.json data
 */
export async function analyzeWithFoodDb(
  ingredients: string[],
  foodDbMatches: FoodDbEntry[],
  userConditions: string[],
  userGoals: string[]
): Promise<AnalysisOption> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const foodDbContext = foodDbMatches
    .map(
      (f) =>
        `${f.name} (${f.food_group}): ${f.description.substring(0, 200)}`
    )
    .join('\n')

  const prompt = `You are a nutritional health expert. Rate this product ONLY - do NOT discuss general nutrition or make comparisons.

INGREDIENTS: ${ingredients.join(', ')}

FOOD DATABASE INFORMATION:
${foodDbContext || 'No database matches found'}

USER PROFILE:
- Health Conditions: ${userConditions.join(', ') || 'Not specified'}
- Health Goals: ${userGoals.join(', ') || 'Not specified'}

Be DIRECT and CONCISE. Return ONLY valid JSON (no markdown):
{
  "ingredients": ["ingredient1"],
  "analysis": "One sentence impact on their conditions",
  "healthImpact": {
    "positive": ["benefit1"],
    "negative": ["risk1"],
    "neutral": []
  },
  "recommendation": "Yes/No - and why in ONE sentence",
  "score": 7
}`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = parseJsonResponse(responseText)

    if (parsed) {
      return {
        option: '1',
        title: 'Food Database Analysis',
        source: 'Food.json Database',
        ingredients: parsed.ingredients || ingredients,
        analysis: parsed.analysis || 'Unable to analyze',
        healthImpact: parsed.healthImpact || {
          positive: [],
          negative: [],
          neutral: []
        },
        recommendation: parsed.recommendation || 'No recommendation',
        score: parsed.score || 5
      }
    }
  } catch (error) {
    console.error('Error analyzing with Food.json:', error)
  }

  return {
    option: '1',
    title: 'Food Database Analysis',
    source: 'Food.json Database',
    ingredients,
    analysis: 'Analysis unavailable',
    healthImpact: {
      positive: [],
      negative: [],
      neutral: []
    },
    recommendation: 'Unable to generate recommendation',
    score: 0
  }
}

/**
 * Analyze ingredients using Gemini with DuckDuckGo research
 */
export async function analyzeWithWebResearch(
  ingredients: string[],
  webData: Record<string, string>,
  userConditions: string[],
  userGoals: string[]
): Promise<AnalysisOption> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const webContext = Object.entries(webData)
    .map(([ing, data]) => `${ing}:\n${data}`)
    .join('\n\n')

  const prompt = `You are a nutritional health expert. Rate this product ONLY - do NOT discuss general nutrition or make comparisons.

INGREDIENTS: ${ingredients.join(', ')}

RESEARCH DATA:
${webContext}

USER PROFILE:
- Health Conditions: ${userConditions.join(', ') || 'Not specified'}
- Health Goals: ${userGoals.join(', ') || 'Not specified'}

Be DIRECT and CONCISE. Return ONLY valid JSON (no markdown):
{
  "ingredients": ["ingredient1"],
  "analysis": "One sentence impact on their conditions",
  "healthImpact": {
    "positive": ["benefit1"],
    "negative": ["risk1"],
    "neutral": []
  },
  "recommendation": "Yes/No - and why in ONE sentence",
  "score": 7
}`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = parseJsonResponse(responseText)

    if (parsed) {
      return {
        option: '2',
        title: 'Web Research Analysis',
        source: 'DuckDuckGo Research',
        ingredients: parsed.ingredients || ingredients,
        analysis: parsed.analysis || 'Unable to analyze',
        healthImpact: parsed.healthImpact || {
          positive: [],
          negative: [],
          neutral: []
        },
        recommendation: parsed.recommendation || 'No recommendation',
        score: parsed.score || 5
      }
    }
  } catch (error) {
    console.error('Error analyzing with web research:', error)
  }

  return {
    option: '2',
    title: 'Web Research Analysis',
    source: 'DuckDuckGo Research',
    ingredients,
    analysis: 'Analysis unavailable',
    healthImpact: {
      positive: [],
      negative: [],
      neutral: []
    },
    recommendation: 'Unable to generate recommendation',
    score: 0
  }
}

/**
 * Compare two analysis options and generate final recommendation
 */
export async function compareAnalysisOptions(
  option1: AnalysisOption,
  option2: AnalysisOption,
  userConditions: string[],
  userGoals: string[]
): Promise<{
  comparison: string
  finalRecommendation: string
  bestOption: '1' | '2'
  combinedScore: number
}> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are a nutrition expert. Give a FINAL verdict - YES eat this or NO avoid it.

OPTION 1 Score: ${option1.score}/10
OPTION 2 Score: ${option2.score}/10

USER: ${userConditions.join(', ') || 'No conditions specified'} | Goals: ${userGoals.join(', ') || 'None'}

Be DIRECT. Return ONLY valid JSON (no markdown):
{
  "comparison": "",
  "finalRecommendation": "YES/NO - one sentence reason",
  "bestOption": "1 or 2",
  "combinedScore": 7
}`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = parseJsonResponse(responseText)

    if (parsed) {
      return {
        comparison: parsed.comparison || '',
        finalRecommendation: parsed.finalRecommendation || 'Unable to generate recommendation',
        bestOption: parsed.bestOption === '2' ? '2' : '1',
        combinedScore: parsed.combinedScore || 5
      }
    }
  } catch (error) {
    console.error('Error comparing analyses:', error)
  }

  return {
    comparison: '',
    finalRecommendation: 'Unable to generate recommendation',
    bestOption: '1',
    combinedScore: 0
  }
}

/**
 * Build complete RAG context with dual analysis
 */
export async function buildRagContext(
  ingredients: string[],
  userConditions: string[] = [],
  userGoals: string[] = []
): Promise<RagContext> {
  try {
    // Step 1: Search Food.json database
    const foodDbMatches = await searchFoodDatabase(ingredients)

    // Step 2: Fetch web research data for each ingredient
    const webData: Record<string, string> = {}
    const webDataPromises = ingredients.map(async (ing) => {
      const data = await searchDuckDuckGo(ing)
      webData[ing] = data
    })
    await Promise.all(webDataPromises)

    // Step 3: Run both analyses in parallel using LLM
    const [option1, option2] = await Promise.all([
      analyzeWithFoodDb(ingredients, foodDbMatches, userConditions, userGoals),
      analyzeWithWebResearch(ingredients, webData, userConditions, userGoals)
    ])

    // Step 4: Compare and generate final recommendation
    const comparison = await compareAnalysisOptions(
      option1,
      option2,
      userConditions,
      userGoals
    )

    return {
      foodDbMatches,
      analysisOptions: [option1, option2],
      combinedNutritionInfo: {
        options: [option1, option2],
        comparison: comparison.comparison,
        finalRecommendation: comparison.finalRecommendation,
        bestOption: comparison.bestOption,
        combinedScore: comparison.combinedScore
      }
    }
  } catch (error) {
    console.error('Error building RAG context:', error)
    return {
      foodDbMatches: [],
      analysisOptions: [],
      combinedNutritionInfo: {}
    }
  }
}
