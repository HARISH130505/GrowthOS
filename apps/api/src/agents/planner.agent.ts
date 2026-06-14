import { generateJSON } from "../lib/gemini";

export interface PlannerOutput {
  objective: string;
  strategy: string;
  segmentCriteria: {
    inactiveDays?: number;
    maxInactiveDays?: number;
    minSpend?: number;
    maxSpend?: number;
    minOrders?: number;
    maxOrders?: number;
    cities?: string[];
    preferredChannel?: string;
    newCustomers?: boolean;
    noPurchase?: boolean;
  };
  recommendedChannel: "EMAIL" | "SMS" | "WHATSAPP" | "RCS";
  expectedKPIs: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenueImpact: number;
  };
  rationale: string;
  campaignName: string;
}

const PLANNER_SYSTEM_PROMPT = `You are a Growth Strategy AI for an Indian e-commerce platform called GrowthOS.
Your job is to analyze a marketer's business goal and convert it into a structured, actionable campaign plan.

You must return ONLY valid JSON (no markdown, no explanation) with this exact schema:
{
  "objective": "specific, measurable objective",
  "strategy": "the tactical approach to achieve the objective",
  "segmentCriteria": {
    "inactiveDays": number (optional - customers inactive for X+ days),
    "maxInactiveDays": number (optional - upper bound for inactivity),
    "minSpend": number (optional - minimum total spend in INR),
    "maxSpend": number (optional - maximum total spend in INR),
    "minOrders": number (optional - minimum number of orders),
    "maxOrders": number (optional - maximum number of orders),
    "cities": string[] (optional - target cities),
    "preferredChannel": "EMAIL"|"SMS"|"WHATSAPP"|"RCS" (optional),
    "newCustomers": boolean (optional - target newly registered customers),
    "noPurchase": boolean (optional - target customers with no purchase)
  },
  "recommendedChannel": "EMAIL" | "SMS" | "WHATSAPP" | "RCS",
  "expectedKPIs": {
    "openRate": number (0-1),
    "clickRate": number (0-1),
    "conversionRate": number (0-1),
    "revenueImpact": number (estimated INR revenue)
  },
  "rationale": "brief explanation of why this strategy will work",
  "campaignName": "short catchy campaign name"
}

Channel selection guidance:
- WHATSAPP: Best for dormant/inactive customers, highest open rates in India (~68%)
- EMAIL: Best for high-value customers, detailed offers, upselling
- SMS: Best for urgent offers, churn risk customers, transactional
- RCS: Best for rich media, premium customers

Be realistic with KPI estimates based on Indian e-commerce benchmarks.`;

export async function runPlannerAgent(goal: string): Promise<PlannerOutput> {
  return generateJSON<PlannerOutput>(PLANNER_SYSTEM_PROMPT, goal);
}
