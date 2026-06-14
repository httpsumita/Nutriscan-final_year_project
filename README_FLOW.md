# Nutriscan - Food Health Analysis Platform

## 📋 Overview

**Nutriscan** is an AI-powered food nutrition analysis platform that helps users make informed dietary choices based on their personal health conditions (PCOS, Thyroid, Diabetes, Insulin Resistance, Menopause). The app uses computer vision, RAG-based search, and LLM-powered chat to provide personalized food recommendations.

## 🎯 Complete User Flow

### **Phase 1: Authentication & Onboarding**

```
1. User Visits App
   ↓
2. Sign Up / Sign In
   ├─ Email/Password authentication via NextAuth
   ↓
3. Onboarding Form
   ├─ Personal Info (Name, Age, Sex)
   ├─ Health Conditions Selection
   │  ├─ PCOS (Polycystic Ovary Syndrome)
   │  ├─ Thyroid (Thyroid dysfunction)
   │  ├─ Type 2 Diabetes
   │  ├─ Insulin Resistance
   │  └─ Menopause
   ├─ Health Goals (Weight Management, Energy, etc.)
   ├─ Blood Report Upload (PDF/JPG/PNG, max 10MB)
   └─ Store Profile in Database
```

**Endpoint:** `POST /api/onboarding`
- Stores user profile with health conditions and goals
- Saves medical report file references

---

### **Phase 2: Food Product Scanning**

```
1. User Navigates to Scan Page (/scan)
   ↓
2. "Open Camera" Button
   ├─ Requests camera access
   ├─ Activates device camera (environment mode)
   ↓
3. Capture Product Image
   ├─ User points camera at food product
   ├─ Clicks "Capture" button
   ├─ Image converted to Base64
   ↓
4. Send to Analysis API
   └─ POST /api/scan-image with imageData
```

---

### **Phase 3: Intelligent Product Analysis**

The backend performs a 4-step analysis:

#### **Step 1: Text Extraction via Google Vision OCR**
```
Image Input
   ↓
Google Cloud Vision API
   ├─ TEXT_DETECTION request
   ├─ Extracts all visible text
   ↓
Parse Product Information
   ├─ Product Name
   ├─ Ingredients List
   ├─ Nutrition Facts
   └─ Allergen Information
```
**File:** `src/lib/vision.ts`
- Uses `@google-cloud/vision` client
- Requires `GOOGLE_CLOUD_VISION_KEY_PATH` environment variable
- Free tier: 1000 requests/month

---

#### **Step 2: RAG (Retrieval-Augmented Generation) Search**
```
Extracted Ingredients
   ↓
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
v                              v                              v

Search Food.json DB         Search DuckDuckGo          Combine Results
├─ Line-by-line search      ├─ Web search for each    ├─ Nutrition info
├─ Match ingredients        │  ingredient             ├─ Health benefits
├─ Return top 10 matches    ├─ Calories, macros       ├─ Warnings
└─ Food groups, nutrients   └─ Health claims          └─ Scientific data

RAG Context Ready
```
**File:** `src/lib/rag-search.ts`
- Searches 25,000+ foods in `food_db/Food.json`
- Queries DuckDuckGo API (no auth needed)
- Aggregates nutritional data from both sources

---

#### **Step 3: Health-Based Scoring (1-10 Scale)**
```
Product Ingredients + User Health Profile
   ↓
Score Each Ingredient Against Health Conditions
   ├─ PCOS: Beneficial (spinach, nuts, fish)
   │        Avoid (refined grains, sugar)
   │
   ├─ Diabetes: Beneficial (fiber, whole grain)
   │            Avoid (sugar, high fructose)
   │
   ├─ Thyroid: Beneficial (iodine, selenium)
   │           Caution (raw cruciferous)
   │
   ├─ Insulin Resistance: Beneficial (fiber, protein)
   │                      Avoid (refined carbs)
   │
   └─ Menopause: Beneficial (calcium, phytoestrogen)
                 Caution (caffeine)
   ↓
Calculate Overall Score (1-10)
   ├─ 9-10: Excellent choice
   ├─ 7-8:  Good choice
   ├─ 5-6:  Neutral (use with caution)
   └─ 1-4:  Poor choice
   ↓
Generate Health Recommendation
   └─ Personalized insight based on conditions
```
**File:** `src/lib/scoring-enhanced.ts`
- Domain-specific nutrition knowledge
- Condition-specific benefit/risk assessment
- Returns: score, recommendation, risk factors, benefit factors

---

#### **Step 4: Daily Intake Tracking**
```
Product Analysis Complete
   ↓
Store in Daily Log
   ├─ Product name + score
   ├─ Timestamp
   └─ User ID
   ↓
Calculate Daily Hormonal Load (0-100)
   ├─ Aggregate all consumed items
   ├─ Weight by health impact
   └─ Show cumulative daily stress on hormones
```

---

### **Phase 4: Chat-Based Product Insights**

```
Analysis Results Displayed
   ↓
Initial AI Message Shows:
   ├─ Product Name
   ├─ Compatibility Score (1-10)
   ├─ ✅ Recommended / ⚠️ Use with caution
   ├─ Key Health Info
   ├─ Benefits for Their Conditions
   └─ Considerations/Warnings
   ↓
User Asks Follow-Up Questions
   ├─ "Is this good for my PCOS?"
   ├─ "How many calories?"
   ├─ "Any allergens?"
   └─ etc.
   ↓
LLM Response (Gemini 2.5 Flash)
   ├─ Contextual product info
   ├─ User's health conditions considered
   ├─ Concise, conversational answer
   ↓
Chat History Maintained
   └─ Full conversation visible
```

**Endpoint:** `POST /api/product-chat`
- Takes: product info, user question, health conditions
- Uses: Google Generative AI (Gemini 2.5 Flash)
- Returns: conversational response about product

---

### **Phase 5: Dashboard & Daily Summary**

```
User Views Dashboard (/dashboard)
   ↓
Today's Intake Summary
   ├─ Total Products Scanned
   ├─ Average Compatibility Score
   ├─ Daily Hormonal Load (0-100)
   └─ List of Consumed Items
   ↓
Historical Data
   ├─ View past scans
   ├─ Track patterns
   └─ Monitor hormonal stress trends
```

**Endpoint:** `GET /api/daily-summary?date=YYYY-MM-DD`
- Returns daily intake summary
- Shows hormonal load score
- Lists all products consumed that day

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│ • Authentication (Sign In/Up)          (/auth/signin)       │
│ • Onboarding Form                      (/onboarding)        │
│ • Camera Scan Interface                (/scan)              │
│ • Dashboard & Summary                  (/dashboard)         │
└────────────────┬──────────────────────────────────────────┘
                 │ API Calls (HTTPS/JSON)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────┤
│ Routes:                                                      │
│  • POST /api/scan-image         (Image analysis pipeline)   │
│  • POST /api/product-chat       (LLM conversation)          │
│  • POST /api/onboarding         (User profile setup)        │
│  • GET  /api/daily-summary      (Daily intake tracking)     │
│  • POST /api/upload-medical-report (Blood report storage)   │
│  • GET  /api/medical-reports    (Report retrieval)          │
│  • POST /api/auth/[...nextauth] (Authentication)            │
└────────────────┬──────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    ↓            ↓            ↓              ↓              ↓
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Google  │ │DuckDuckGo│ │Google    │ │PostgreSQL│ │File      │
│Vision  │ │Search    │ │Gemini    │ │Database  │ │Storage   │
│API     │ │API       │ │API       │ │(Prisma)  │ │(Medical  │
│        │ │          │ │          │ │          │ │Reports)  │
│OCR     │ │Web       │ │LLM       │ │User      │ │          │
│        │ │Search    │ │Chat      │ │Profile   │ │          │
│        │ │          │ │          │ │Scan Data │ │          │
└────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────┐
│              External Data Sources                           │
├─────────────────────────────────────────────────────────────┤
│ • food_db/Food.json    (25,000+ food items with nutrients)  │
│ • Google Vision        (OCR text extraction)                │
│ • DuckDuckGo           (Real-time nutritional web search)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.5.14, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js App Router, TypeScript, Node.js |
| **Authentication** | NextAuth v5 |
| **Database** | PostgreSQL + Prisma ORM |
| **AI/ML** | Google Vision API, Google Gemini 2.5, DuckDuckGo API |
| **APIs** | Google Cloud Vision, Google Generative AI, DuckDuckGo Search |
| **File Storage** | Local filesystem + Database |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL (optional - app works without it)
- Google Cloud Account (Vision & Gemini APIs)
- Environment variables configured

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nutriscan

# Google Cloud
GOOGLE_CLOUD_VISION_KEY_PATH=/path/to/credentials.json
GEMINI_API_KEY=your-gemini-api-key

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Installation
```bash
# Install dependencies
npm install

# Set up database (optional)
npx prisma migrate dev

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📊 Data Flow Examples

### Example 1: Scanning an Apple

```
1. User captures apple image
   ↓
2. Vision API extracts:
   "Apple, Vitamin C, Fiber, Natural sugars, Antioxidants"
   ↓
3. RAG Search finds:
   - Apple entry in Food.json (Fruits, Tropicals)
   - DuckDuckGo: Apple nutritional benefits, calories (52/100g)
   ↓
4. Score Product (User with PCOS):
   - Fiber ✅ (beneficial)
   - Natural sugars ⚠️ (moderate concern)
   - Low glycemic impact ✅
   → Score: 8/10 (Good choice)
   ↓
5. Chat Response:
   "Apples are excellent for PCOS! High in fiber, which helps 
   with insulin resistance. The natural sugars are fine in 
   moderation. Stick to 1-2 medium apples per day."
```

### Example 2: Scanning Processed Snack Food

```
1. Vision API extracts:
   "Sugar, High Fructose Corn Syrup, Refined Carbs, 
    Artificial Sweeteners, Sodium"
   ↓
2. RAG Search identifies:
   - Processed snack category
   - High sugar content
   - Minimal nutritional value
   ↓
3. Score Product (User with Diabetes):
   - Added sugars ❌ (major concern)
   - Refined carbs ❌ (avoid)
   - Low fiber ❌
   → Score: 2/10 (Poor choice)
   ↓
4. Chat Response:
   "I'd recommend avoiding this. With diabetes, the high 
   sugar and refined carbs will spike your blood glucose. 
   Look for alternatives with <5g sugar and >3g fiber."
```

---

## 📈 Database Schema

```prisma
model User {
  id              String
  email           String (unique)
  password        String
  name            String
  age             Int
  sex             String
  conditions      String[] (e.g., ["PCOS", "Diabetes"])
  goals           String[]
  medicalReports  MedicalReport[]
  scans           Scan[]
  dailyLogs       DailyLog[]
}

model MedicalReport {
  id        String
  userId    String
  fileName  String
  data      Bytes (base64 encrypted)
  uploadedAt DateTime
}

model Scan {
  id          String
  userId      String
  productName String
  ingredients String[]
  nutrition   Json
  score       Int (0-100)
  timestamp   DateTime
}

model DailyLog {
  id                 String
  userId             String
  date               DateTime
  consumedItems      String[] (e.g., "Apple|8", "Snack|2")
  hormonalLoadScore  Int (0-100)
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/session` - Get current session

### Scanning & Analysis
- `POST /api/scan-image` - Analyze food product image
  - Input: `{ imageData: string }`
  - Output: `{ ok, product: { productName, score, recommendation, ... } }`

- `POST /api/product-chat` - Chat about product
  - Input: `{ productName, ingredients, question, conditions, goals }`
  - Output: `{ ok, response: string }`

### User Management
- `POST /api/onboarding` - Complete user profile
  - Input: `{ name, age, sex, conditions, goals, medicalReportIds }`
  
- `POST /api/upload-medical-report` - Upload blood report
  - Input: `{ file: File }`
  - Output: `{ ok, report: { id, fileName, uploadedAt } }`

- `GET /api/medical-reports` - List user's reports
  - Output: `{ ok, reports: MedicalReport[] }`

### Dashboard
- `GET /api/daily-summary?date=YYYY-MM-DD` - Daily intake summary
  - Output: `{ ok, date, consumedItems, hormonalLoadScore, ... }`

---

## 🎨 UI Components

| Page | Purpose |
|------|---------|
| `/` | Landing page |
| `/auth/signin` | Authentication |
| `/onboarding` | Health profile setup |
| `/scan` | Camera capture & chat interface |
| `/dashboard` | Daily summary & history |

---

## ⚡ Key Features

✅ **AI-Powered Analysis**
- Google Vision OCR for text extraction
- RAG (Retrieval-Augmented Generation) combining 25K+ foods + web search
- Gemini LLM for conversational insights

✅ **Personalized Health Scoring**
- 1-10 scale based on user's health conditions
- Daily hormonal load tracking
- Risk/benefit factor identification

✅ **Chat Interface**
- Ask questions about scanned products
- Get personalized recommendations
- Context-aware responses from LLM

✅ **Medical Profile**
- Upload blood reports for reference
- Select multiple health conditions
- Set personalized health goals

✅ **Offline-Capable**
- Works without PostgreSQL
- Uses defaults if database unavailable
- Always returns analysis results

---

## 🐛 Error Handling

| Error | Handling |
|-------|----------|
| Database Unavailable | Uses default user profile, skips data storage |
| Vision API Fails | Returns error message to user |
| Invalid Image | Returns validation error |
| No Ingredients Found | Proceeds with generic scoring |
| Network Error | Displays user-friendly error message |

---

## 📱 Mobile Experience

- **Responsive Design**: Works on phones, tablets, desktop
- **Camera Access**: Native device camera integration
- **Touch-Friendly**: Large buttons and input fields
- **Chat UI**: Conversation-style interface for natural interaction

---

## 🔐 Security

- NextAuth for secure authentication
- Environment variables for sensitive keys
- Medical reports encrypted in storage
- User data isolated by ID
- HTTPS-only in production

---

## 📊 Example Daily Dashboard

```
Today's Intake Summary
═════════════════════════════════════

📅 June 14, 2026

🍎 Consumed Items (3)
├─ Apple            Score: 8/10 ✅
├─ Almond Butter    Score: 8.5/10 ✅
└─ Sugary Snack     Score: 2/10 ⚠️

📈 Average Score: 6.2/10

⚡ Daily Hormonal Load: 45/100 (Moderate)

Health Status:
✅ Good intake of fiber
⚠️ Spike in sugar at 3 PM - avoid similar snacks tomorrow
✅ Balanced protein intake
```

---

## 🎯 Future Enhancements

- [ ] Barcode scanning for packaged foods
- [ ] Meal planning assistant
- [ ] Nutritionist consultation booking
- [ ] Food database crowdsourcing
- [ ] Wearable device integration (glucose, hormones)
- [ ] Meal photo recognition
- [ ] Recipe suggestions
- [ ] Community food reviews

---

## 📝 License

This project is built for Nutriscan educational purposes.

---

**Last Updated:** June 14, 2026
