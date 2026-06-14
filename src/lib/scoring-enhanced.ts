import { RagContext } from './rag-search'

interface UserHealthProfile {
  conditions: string[]
  goals: string[]
  allergies?: string[]
}

interface IngredientScore {
  ingredient: string
  score: number
  reason: string
  healthImpact: 'beneficial' | 'neutral' | 'caution' | 'avoid'
}

interface ProductScore {
  overallScore: number // 1-10
  ingredientScores: IngredientScore[]
  healthRecommendation: string
  shouldConsume: boolean
  riskFactors: string[]
  benefitFactors: string[]
}

/**
 * Score a product based on user's health profile and RAG context
 * Returns a score from 1 (avoid) to 10 (excellent choice)
 */
export function scoreProductForUserHealth(
  productName: string,
  ingredients: string[],
  userProfile: UserHealthProfile,
  ragContext?: any
): ProductScore {
  const ingredientScores: IngredientScore[] = []
  const riskFactors: string[] = []
  const benefitFactors: string[] = []
  let totalScore = 0

  // Check each ingredient against user conditions
  for (const ingredient of ingredients) {
    const score = scoreIngredient(ingredient, userProfile, ragContext)
    ingredientScores.push(score)

    totalScore += score.score

    // Collect risk and benefit factors
    if (score.healthImpact === 'avoid' || score.healthImpact === 'caution') {
      riskFactors.push(`${ingredient}: ${score.reason}`)
    } else if (score.healthImpact === 'beneficial') {
      benefitFactors.push(`${ingredient}: ${score.reason}`)
    }
  }

  // Calculate average score (1-10)
  const overallScore = Math.round((totalScore / Math.max(ingredients.length, 1)) * 10) / 10
  const finalScore = Math.max(1, Math.min(10, overallScore))

  // Determine recommendation
  const { recommendation, shouldConsume } = generateRecommendation(
    finalScore,
    riskFactors,
    benefitFactors,
    userProfile
  )

  return {
    overallScore: finalScore,
    ingredientScores,
    healthRecommendation: recommendation,
    shouldConsume,
    riskFactors,
    benefitFactors
  }
}

/**
 * Score individual ingredient based on user health profile
 */
function scoreIngredient(
  ingredient: string,
  userProfile: UserHealthProfile,
  ragContext?: any
): IngredientScore {
  const ingredient_lower = ingredient.toLowerCase()
  let score = 5 // Start at neutral

  // Ingredient scoring rules based on common conditions
  const scoringRules = getIngredientScoringRules()

  for (const condition of userProfile.conditions) {
    const condition_lower = condition.toLowerCase()

    if (scoringRules[condition_lower]) {
      const rule = scoringRules[condition_lower]

      // Check beneficial ingredients
      if (rule.beneficial.some(ing => ingredient_lower.includes(ing))) {
        score = Math.min(10, score + 3)
      }

      // Check neutral ingredients
      if (rule.neutral.some(ing => ingredient_lower.includes(ing))) {
        score = 5
      }

      // Check caution ingredients
      if (rule.caution.some(ing => ingredient_lower.includes(ing))) {
        score = Math.max(1, score - 2)
      }

      // Check avoid ingredients
      if (rule.avoid.some(ing => ingredient_lower.includes(ing))) {
        score = 2
      }
    }
  }

  // Check for allergens
  const commonAllergens = ['milk', 'eggs', 'peanuts', 'tree nuts', 'fish', 'shellfish', 'soy', 'wheat', 'sesame']
  if (userProfile.allergies) {
    for (const allergen of userProfile.allergies) {
      if (ingredient_lower.includes(allergen)) {
        score = 1
      }
    }
  }

  // Determine health impact category
  let healthImpact: 'beneficial' | 'neutral' | 'caution' | 'avoid'
  let reason = ''

  if (score >= 8) {
    healthImpact = 'beneficial'
    reason = 'Good match for your health profile'
  } else if (score >= 6) {
    healthImpact = 'neutral'
    reason = 'Acceptable for most diets'
  } else if (score >= 3) {
    healthImpact = 'caution'
    reason = 'May not be ideal for your condition'
  } else {
    healthImpact = 'avoid'
    reason = 'Not recommended for your health condition'
  }

  return {
    ingredient,
    score,
    reason,
    healthImpact
  }
}

/**
 * Ingredient scoring rules for common health conditions
 */
function getIngredientScoringRules(): Record<string, any> {
  return {
    pcos: {
      beneficial: ['spinach', 'broccoli', 'leafy greens', 'almonds', 'nuts', 'berries', 'fish', 'omega'],
      caution: ['refined grains', 'sugar', 'high sodium', 'processed'],
      avoid: ['high fructose', 'white bread', 'white rice', 'sugary drinks'],
      neutral: []
    },
    diabetes: {
      beneficial: ['fiber', 'leafy greens', 'whole grain', 'oats', 'nuts', 'fish'],
      caution: ['refined carbs', 'sugar', 'white flour'],
      avoid: ['sugar', 'glucose', 'high fructose', 'sweetened'],
      neutral: []
    },
    thyroid: {
      beneficial: ['iodine', 'selenium', 'zinc', 'iron', 'seafood', 'seaweed'],
      caution: ['soy', 'cruciferous'],
      avoid: ['excessive cruciferous raw'],
      neutral: []
    },
    menopause: {
      beneficial: ['calcium', 'phytoestrogen', 'soy', 'flaxseed', 'omega', 'vitamin d'],
      caution: ['caffeine', 'alcohol', 'spicy'],
      avoid: [],
      neutral: []
    },
    insulin_resistance: {
      beneficial: ['fiber', 'whole grain', 'protein', 'leafy greens', 'nuts'],
      caution: ['refined carbs', 'sugar', 'processed'],
      avoid: ['sugar', 'white bread', 'white rice'],
      neutral: []
    }
  }
}

/**
 * Generate health recommendation based on score and factors
 */
function generateRecommendation(
  score: number,
  riskFactors: string[],
  benefitFactors: string[],
  userProfile: UserHealthProfile
): { recommendation: string; shouldConsume: boolean } {
  if (score >= 8) {
    return {
      recommendation: `Excellent choice! This product aligns well with your health profile. ${benefitFactors.length > 0 ? 'Benefits: ' + benefitFactors[0] : ''}`,
      shouldConsume: true
    }
  } else if (score >= 6) {
    return {
      recommendation: `Good option. This product is acceptable for your diet. ${riskFactors.length > 0 ? 'Consider: ' + riskFactors[0] : ''}`,
      shouldConsume: true
    }
  } else if (score >= 4) {
    return {
      recommendation: `Caution: This product has some ingredients that may not be ideal for your ${userProfile.conditions.join(', ')}. ${riskFactors.length > 0 ? 'Issues: ' + riskFactors[0] : ''} Consider moderation or alternatives.`,
      shouldConsume: false
    }
  } else {
    return {
      recommendation: `Avoid: This product contains ingredients not recommended for your health conditions. Look for alternatives. ${riskFactors.length > 0 ? 'Problems: ' + riskFactors[0] : ''}`,
      shouldConsume: false
    }
  }
}

/**
 * Calculate daily hormonal load score based on consumed items
 */
export function calculateDailyHormonalLoad(consumedItems: string[], userProfile: UserHealthProfile): number {
  let totalLoad = 0

  for (const item of consumedItems) {
    // Parse stored item data (format: "productName|score")
    const [productName, scoreStr] = item.split('|')
    const score = parseInt(scoreStr) || 5

    // Convert 1-10 score to hormonal load (1-10 scale inverted for load)
    const load = 11 - score // 1-10 becomes 10-1

    totalLoad += load
  }

  // Calculate average and normalize to 0-100
  const avgLoad = consumedItems.length > 0 ? (totalLoad / consumedItems.length) * 10 : 50

  return Math.round(Math.max(0, Math.min(100, avgLoad)))
}
