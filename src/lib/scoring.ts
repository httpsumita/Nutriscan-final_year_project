type UserProfile = {
  conditions: string[]
  goals: string[]
}

type ScoreBreakdown = {
  base: number
  ingredientPenalties: number
  conditionPenalties: number
  dailyLoadPenalty: number
  nutrientBonuses: number
  goalBonuses: number
  final: number
  flags: string[]
  positives: string[]
}

// ── Expanded ingredient risk database ──────────────────────────────
const riskIngredients: Record<string, number> = {
  // Sugars
  "sugar": 15,
  "high fructose corn syrup": 22,
  "corn syrup": 18,
  "fructose": 14,
  "glucose": 12,
  "dextrose": 12,
  "maltose": 10,
  "sucrose": 14,
  "cane sugar": 14,
  "brown sugar": 13,
  "invert sugar": 14,
  "molasses": 10,
  "agave": 10,
  "honey": 8,

  // Artificial sweeteners
  "aspartame": 10,
  "saccharin": 9,
  "sucralose": 8,
  "acesulfame": 8,
  "neotame": 7,

  // Bad fats
  "trans fat": 25,
  "partially hydrogenated": 25,
  "hydrogenated oil": 22,
  "palm oil": 12,
  "palm kernel oil": 14,
  "shortening": 15,
  "interesterified fat": 18,

  // Additives & preservatives
  "monosodium glutamate": 8,
  "msg": 8,
  "sodium nitrate": 12,
  "sodium nitrite": 12,
  "bha": 10,
  "bht": 10,
  "tbhq": 10,
  "carrageenan": 8,
  "potassium bromate": 12,
  "brominated vegetable oil": 10,
  "propyl gallate": 8,

  // Refined carbs
  "refined flour": 10,
  "white flour": 10,
  "enriched flour": 8,
  "bleached flour": 10,
  "modified starch": 6,
  "maltodextrin": 12,

  // Artificial colors
  "red 40": 7,
  "yellow 5": 7,
  "yellow 6": 7,
  "blue 1": 7,
  "red 3": 7,

  // Sodium
  "sodium benzoate": 8,
  "disodium": 6,
}

// ── Ultra-processed food markers ───────────────────────────────────
const ultraProcessedMarkers = [
  "artificial flavor", "natural flavor", "artificial color",
  "modified starch", "emulsifier", "stabilizer", "thickener",
  "maltodextrin", "hydrolyzed", "isolated protein", "interesterified"
]

// ── Beneficial ingredients ──────────────────────────────────────────
const beneficialIngredients: Record<string, number> = {
  "flaxseed": 5,
  "chia": 5,
  "salmon": 5,
  "omega-3": 5,
  "turmeric": 4,
  "ginger": 3,
  "cinnamon": 4,
  "green tea": 3,
  "spinach": 3,
  "kale": 3,
  "blueberry": 3,
  "oats": 4,
  "quinoa": 4,
  "lentil": 4,
  "chickpea": 4,
  "almond": 3,
  "walnut": 4,
  "olive oil": 4,
  "avocado": 4,
  "broccoli": 3,
  "sweet potato": 3,
}

// ── Condition-specific thresholds ──────────────────────────────────
const conditionRules: Record<string, (nutrition: Record<string, any>, ingredientFlags: string[]) => { penalty: number; flags: string[] }> = {
  "PCOS": (nutrition, ingredientFlags) => {
    let penalty = 0
    const flags: string[] = []
    if (nutrition.sugar > 10) { penalty += 20; flags.push("High sugar — bad for PCOS insulin sensitivity") }
    else if (nutrition.sugar > 5) { penalty += 10; flags.push("Moderate sugar — monitor for PCOS") }
    if (ingredientFlags.includes("ultraProcessed")) { penalty += 15; flags.push("Ultra-processed — triggers PCOS inflammation") }
    if (nutrition.saturatedFat > 5) { penalty += 8; flags.push("Saturated fat raises androgen levels") }
    return { penalty, flags }
  },
  "Thyroid": (nutrition, ingredientFlags) => {
    let penalty = 0
    const flags: string[] = []
    if (nutrition.sodium > 400) { penalty += 10; flags.push("High sodium — affects thyroid function") }
    if (ingredientFlags.includes("ultraProcessed")) { penalty += 10; flags.push("Ultra-processed — disrupts thyroid hormones") }
    if (nutrition.sugar > 15) { penalty += 8; flags.push("High sugar — impacts thyroid regulation") }
    return { penalty, flags }
  },
  "Insulin resistance": (nutrition, ingredientFlags) => {
    let penalty = 0
    const flags: string[] = []
    if (nutrition.sugar > 5) { penalty += 25; flags.push("Even moderate sugar is dangerous for insulin resistance") }
    else if (nutrition.sugar > 2) { penalty += 12; flags.push("Low sugar still impacts insulin resistance") }
    if (nutrition.carbs > 30) { penalty += 10; flags.push("High carbs spike insulin") }
    if (ingredientFlags.includes("ultraProcessed")) { penalty += 12; flags.push("Ultra-processed worsens insulin sensitivity") }
    return { penalty, flags }
  },
  "Menopause": (nutrition, ingredientFlags) => {
    let penalty = 0
    const flags: string[] = []
    if (nutrition.sodium > 500) { penalty += 10; flags.push("High sodium worsens menopause bloating") }
    if (nutrition.saturatedFat > 7) { penalty += 8; flags.push("Saturated fat impacts estrogen balance") }
    if (ingredientFlags.includes("ultraProcessed")) { penalty += 8; flags.push("Ultra-processed increases hot flash risk") }
    if (nutrition.sugar > 12) { penalty += 10; flags.push("Sugar disrupts hormonal balance in menopause") }
    return { penalty, flags }
  },
  "Type 2 diabetes": (nutrition, ingredientFlags) => {
    let penalty = 0
    const flags: string[] = []
    if (nutrition.sugar > 3) { penalty += 30; flags.push("Any significant sugar is dangerous for Type 2 diabetes") }
    if (nutrition.carbs > 25) { penalty += 15; flags.push("High carbs cause dangerous blood sugar spikes") }
    if (ingredientFlags.includes("ultraProcessed")) { penalty += 15; flags.push("Ultra-processed food worsens glycemic control") }
    if (nutrition.saturatedFat > 5) { penalty += 10; flags.push("Saturated fat increases insulin resistance") }
    return { penalty, flags }
  }
}

// ── Goal-based bonuses ─────────────────────────────────────────────
const goalBonusRules: Record<string, (nutrition: Record<string, any>) => number> = {
  "Weight management": (n) => {
    let bonus = 0
    if (n.protein > 10) bonus += 5
    if (n.fiber > 5) bonus += 5
    if (n.calories < 150) bonus += 3
    return bonus
  },
  "Hormone balance": (n) => {
    let bonus = 0
    if (n.omega3) bonus += 5
    if (n.fiber > 3) bonus += 3
    return bonus
  },
  "Energy optimization": (n) => {
    let bonus = 0
    if (n.protein > 8) bonus += 4
    if (n.iron) bonus += 3
    if (n.vitaminB12) bonus += 3
    return bonus
  },
  "Reduce inflammation": (n) => {
    let bonus = 0
    if (n.omega3) bonus += 6
    if (n.fiber > 4) bonus += 4
    return bonus
  },
  "Improve digestion": (n) => {
    let bonus = 0
    if (n.fiber > 5) bonus += 6
    if (n.probiotics) bonus += 5
    return bonus
  }
}

// ── Main scoring function ──────────────────────────────────────────
export function computeScore(
  base = 100,
  ingredients: string[] = [],
  user: UserProfile,
  dailyLoad = 0,
  nutrition: Record<string, any> = {}
): number {
  return computeDetailedScore(base, ingredients, user, dailyLoad, nutrition).final
}

export function computeDetailedScore(
  base = 100,
  ingredients: string[] = [],
  user: UserProfile,
  dailyLoad = 0,
  nutrition: Record<string, any> = {}
): ScoreBreakdown {
  let ingredientPenalties = 0
  let conditionPenalties = 0
  let nutrientBonuses = 0
  let goalBonuses = 0
  const flags: string[] = []
  const positives: string[] = []

  // ── Step 1: Ingredient risk scan ──
  for (const ing of ingredients) {
    const lower = ing.toLowerCase()
    for (const [risk, penalty] of Object.entries(riskIngredients)) {
      if (lower.includes(risk)) {
        ingredientPenalties += penalty
        flags.push(`Contains ${risk}`)
      }
    }
    for (const [benefit, bonus] of Object.entries(beneficialIngredients)) {
      if (lower.includes(benefit)) {
        nutrientBonuses += bonus
        positives.push(`Contains ${benefit}`)
      }
    }
  }

  // ── Step 2: Detect ultra-processed ──
  const ingredientText = ingredients.join(" ").toLowerCase()
  const ultraProcessedCount = ultraProcessedMarkers.filter(m => ingredientText.includes(m)).length
  const ingredientFlags: string[] = []
  if (ultraProcessedCount >= 2) {
    ingredientFlags.push("ultraProcessed")
    flags.push(`Ultra-processed food detected (${ultraProcessedCount} markers)`)
  }

  // ── Step 3: Condition-specific penalties ──
  for (const condition of user.conditions) {
    const rule = conditionRules[condition]
    if (rule) {
      const { penalty, flags: conditionFlags } = rule(nutrition, ingredientFlags)
      conditionPenalties += penalty
      flags.push(...conditionFlags)
    }
  }

  // ── Step 4: Daily load penalty ──
  const dailyLoadPenalty = Math.min(30, dailyLoad * 2)
  if (dailyLoadPenalty > 10) flags.push("High daily consumption — consider reducing intake")

  // ── Step 5: Nutrition bonuses ──
  if (nutrition.protein > 5) { nutrientBonuses += 5; positives.push("Good protein content") }
  if (nutrition.fiber > 3) { nutrientBonuses += 5; positives.push("Good fiber content") }
  if (nutrition.vitaminD) { nutrientBonuses += 3; positives.push("Contains Vitamin D") }
  if (nutrition.omega3) { nutrientBonuses += 5; positives.push("Contains Omega-3") }
  if (nutrition.calcium) { nutrientBonuses += 2; positives.push("Good calcium source") }
  if (nutrition.iron) { nutrientBonuses += 2; positives.push("Good iron source") }

  // ── Step 6: Goal-based bonuses ──
  for (const goal of user.goals) {
    const rule = goalBonusRules[goal]
    if (rule) goalBonuses += rule(nutrition)
  }

  // ── Final score ──
  const final = Math.max(0, Math.min(100, Math.round(
    base - ingredientPenalties - conditionPenalties - dailyLoadPenalty + nutrientBonuses + goalBonuses
  )))

  return {
    base,
    ingredientPenalties,
    conditionPenalties,
    dailyLoadPenalty,
    nutrientBonuses,
    goalBonuses,
    final,
    flags: [...new Set(flags)],
    positives: [...new Set(positives)]
  }
}

// ── Score interpretation ───────────────────────────────────────────
export function interpretScore(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: "Excellent — Great choice for your profile", color: "green", emoji: "✓" }
  if (score >= 60) return { label: "Good — Generally suitable", color: "blue", emoji: "◐" }
  if (score >= 40) return { label: "Fair — Consume with moderation", color: "yellow", emoji: "⚠" }
  if (score >= 20) return { label: "Caution — Limited compatibility", color: "orange", emoji: "⛔" }
  return { label: "Avoid — Not recommended for your profile", color: "red", emoji: "❌" }
}
