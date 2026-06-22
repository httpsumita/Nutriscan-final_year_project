/**
 * Centralized type definitions and configuration for the NutriScan application
 */

// LLM Model Configuration
export const LLM_CONFIG = {
  MODEL: 'gemini-2.5-flash-lite',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1024
} as const

export type LLMModel = typeof LLM_CONFIG.MODEL

// User Health Profile
export interface UserHealthProfile {
  conditions: string[]
  goals: string[]
  allergies?: string[]
}

// Ingredient Analysis
export interface IngredientScore {
  ingredient: string
  score: number
  reason: string
  healthImpact: 'beneficial' | 'neutral' | 'caution' | 'avoid'
}

export interface ProductScore {
  overallScore: number // 1-10
  ingredientScores: IngredientScore[]
  healthRecommendation: string
  shouldConsume: boolean
  riskFactors: string[]
  benefitFactors: string[]
}

// OCR Extraction
export interface ProductExtraction {
  productName: string
  ingredients: string[]
  nutrition: Record<string, any>
  allergens: string[]
}

// Scan Results
export interface ScanResult {
  productName: string
  ingredients: string[]
  nutrition: Record<string, any>
  allergens: string[]
  score: number
  scoreRange: string
  healthRecommendation: string
  shouldConsume: boolean
  riskFactors: string[]
  benefitFactors: string[]
  dailyHormonalLoad: number
  scanId: string | null
  databaseAvailable: boolean
}

// RAG Context
export interface RagContext {
  foodDbMatches: Array<{ name: string; food_group: string }>
  analysisOptions: Array<{ source: string; analysis: string }>
  comparison: string
  finalRecommendation: string
  bestOption: string
  combinedScore: number
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Calorie Log
export interface CalorieEntry {
  id: string
  foodName: string
  category: string
  calories: number
  date: string
}

// Water Log
export interface WaterEntry {
  id: string
  amount: number
  date: string
}

// Daily Summary
export interface DailySummary {
  calories: number
  calorieGoal: number
  water: number
  waterGoal: number
  scans: number
  hormonalLoad: number
}

// Insight Data
export interface DailyData {
  date: string
  load: number
  scans: number
  topProduct: string
}

export interface InsightData {
  hasData: boolean
  week: DailyData[]
  topProducts: { name: string; scans: number; avgScore: string }[]
  calorieData: { day: string; calories: number }[]
  waterData: { day: string; water: number }[]
  totals: {
    totalScans: number
    avgLoad: number
    totalCalories: number
    avgCaloriesPerDay: number
    totalWater: number
    avgWaterPerDay: number
  }
}

// API Responses
export interface ApiResponse<T> {
  ok: boolean
  error?: string
  data?: T
}
