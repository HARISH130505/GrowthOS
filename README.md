# GrowthOS - AI-Native Mini CRM

GrowthOS is an AI-native customer relationship management (CRM) platform designed to help consumer brands reach their shoppers intelligently. It empowers brands to organize customer data, segment audiences, and run personalized campaigns across various channels using the power of AI.

## 🚀 Features

- **Audience Management & Segmentation**: Organize customer data and create targeted segments based on purchase history, behavior, and preferences.
- **AI-Powered Campaign Generation**: Utilize Google's Generative AI (Gemini) to automatically draft highly personalized, contextual messages for your marketing campaigns.
- **Multi-Channel Delivery**: Orchestrate and deliver campaigns across multiple simulated channels (WhatsApp, SMS, Email, etc.).
- **Smart Analytics**: Track delivery rates, opens, and engagement metrics via intuitive dashboards.
- **Background Processing & Webhooks**: Robust background job handling for campaign delivery using BullMQ and Redis, integrated with webhooks for delivery status updates.

## 🛠️ Technology Stack

This project is structured as a monorepo containing both the backend API and frontend web application.

### Backend (`apps/api`)
- **Runtime**: Node.js & Express
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ & Redis (for asynchronous campaign delivery)
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Language**: TypeScript

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui & Radix UI
- **Authentication**: Clerk
- **State Management**: React Query (`@tanstack/react-query`)
- **Charts**: Recharts

## 📦 Prerequisites

Make sure you have the following installed on your machine:
- Node.js (v18+)
- PostgreSQL
- Redis Server (running locally on default port 6379, or provide a URL)

## ⚙️ Setup Instructions

### 1. Clone & Install Dependencies

From the root directory, install all monorepo dependencies:
```bash
npm install
```

### 2. Environment Variables

You will need to set up environment variables for both the API and Web apps.

**Backend (`apps/api/.env`)**:
Create a `.env` file in the `apps/api` directory with the following keys:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/growthos"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="your_google_gemini_api_key"
PORT=3000
CHANNEL_SIM_URL="http://localhost:3001" # Or wherever your simulator is running
```

**Frontend (`apps/web/.env.local`)**:
Create a `.env.local` file in the `apps/web` directory for Clerk Auth and API endpoints:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### 3. Database Setup

Navigate to the API folder and set up the Prisma database schema:
```bash
cd apps/api
npm run db:generate
npm run db:migrate
```
*(Optional)* You can also run `npm run db:seed` to populate the database with dummy customer data.

### 4. Running the Project Locally

You can run both the frontend and backend development servers.

**Start the Backend API:**
```bash
cd apps/api
npm run dev
```

**Start the Frontend Web App:**
Open a new terminal and run:
```bash
cd apps/web
npm run dev
```

The web app will be available at `http://localhost:3000` (or whichever port Next.js assigns if 3000 is taken by the API).

## 📁 Project Structure

```
GrowthOS/
├── apps/
│   ├── api/               # Express Backend
│   │   ├── src/
│   │   │   ├── agents/    # AI Orchestrator & Agents
│   │   │   ├── controllers/
│   │   │   ├── db/        # Prisma schema & Client
│   │   │   ├── queues/    # BullMQ Workers & Queues
│   │   │   └── routes/
│   └── web/               # Next.js Frontend
│       ├── app/           # Next.js App Router
│       ├── components/    # React UI Components
│       └── lib/
├── package.json           # Root workspace config
└── README.md
```

## 📝 License
This project is for demonstration and evaluation purposes.
