type UserProfile = {
  conditions: string[]
  goals: string[]
}

type ScoringFactors = Record<string, number>

// Research-backed scoring weights for different conditions
const conditionWeights: Record<string, ScoringFactors> = {
  PCOS: {
    sugar: -20,
    ultraProcessed: -15,
    conditionMatch: 10
  },
  "Thyroid": {
    iodine: -5,
    ultraProcessed: -10
  },
  "Insulin resistance": {
    sugar: -25,
    saturatedFat: -10
  },
  "Menopause": {
    sodium: -5,
    ultraProcessed: -8
  },
  "Type 2 diabetes": {
    sugar: -30,
    saturatedFat: -15
  }
}

// Ingredient risk database (expandable)
const riskIngredients: Record<string, number> = {
  "sugar": 15,
  "high fructose corn syrup": 20,
  "maltodextrin": 10,
  "monosodium glutamate": 5,
  "artificial sweeteners": 8,
  "trans fat": 25,
  "hydrogenated oil": 20
}

export function computeScore(
  base = 100,
  ingredients: string[] = [],
  user: UserProfile,
  dailyLoad = 0,
  nutrition: Record<string, any> = {}
) {
  let score = base
  let penalties = 0
  let bonuses = 0

  // Ingredient risk: penalize for problematic ingredients
  for (const ing of ingredients) {
    const lower = ing.toLowerCase()
    for (const [risk, penalty] of Object.entries(riskIngredients)) {
      if (lower.includes(risk.toLowerCase())) {
        penalties += penalty
      }
    }
  }

  // Condition-specific penalties
  for (const condition of user.conditions) {
    const weights = conditionWeights[condition]
    if (weights) {
      if (nutrition.sugar && weights.sugar) penalties += weights.sugar
      if (nutrition.saturatedFat && weights.saturatedFat) penalties += weights.saturatedFat
      if (nutrition.sodium && weights.sodium) penalties += weights.sodium
    }
  }

  // Daily load penalty (cumulative consumption)
  penalties += Math.min(30, dailyLoad * 2)

  // Positive nutrients bonus (if applicable)
  if (nutrition.protein && nutrition.protein > 5) bonuses += 5
  if (nutrition.fiber && nutrition.fiber > 3) bonuses += 5
  if (nutrition.vitaminD) bonuses += 3
  if (nutrition.omega3) bonuses += 5

  // Apply all adjustments
  score = score - penalties + bonuses

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function interpretScore(score: number): string {
  if (score >= 80) return "Excellent - Great choice for your profile"
  if (score >= 60) return "Good - Generally suitable"
  if (score >= 40) return "Fair - Consume with moderation"
  if (score >= 20) return "Caution - Limited compatibility"
  return "Avoid - Not recommended for your profile"
}
