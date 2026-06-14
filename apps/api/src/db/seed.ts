import "dotenv/config";
import prisma from "./prisma";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
];

const CHANNELS = ["EMAIL", "SMS", "WHATSAPP", "RCS"] as const;

const PRODUCT_CATEGORIES = [
  { name: "Electronics", items: ["iPhone 15", "MacBook Pro", "AirPods Pro", "iPad Air", "Apple Watch"] },
  { name: "Fashion", items: ["Nike Air Max", "Adidas Hoodie", "Levi's Jeans", "Ray-Ban Sunglasses", "H&M Dress"] },
  { name: "Home & Living", items: ["Dyson Vacuum", "Instant Pot", "IKEA Sofa", "Samsung TV", "Philips Air Fryer"] },
  { name: "Beauty", items: ["Nykaa Foundation", "L'Oréal Shampoo", "Mamaearth Serum", "Plum Moisturizer", "Lakme Lipstick"] },
  { name: "Sports", items: ["Yoga Mat", "Dumbbells Set", "Running Shoes", "Gym Gloves", "Protein Powder"] },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(daysAgo: number, daysAgoEnd = 0) {
  const end = new Date();
  end.setDate(end.getDate() - daysAgoEnd);
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateName() {
  const firstNames = [
    "Arjun", "Priya", "Rahul", "Sneha", "Vikram", "Anjali", "Rohan", "Divya",
    "Karan", "Meera", "Aditya", "Pooja", "Siddharth", "Neha", "Amit", "Riya",
    "Suresh", "Lakshmi", "Rajesh", "Kavya", "Deepak", "Ananya", "Manish", "Shruti",
    "Nikhil", "Swathi", "Gaurav", "Tanvi", "Harsh", "Pallavi",
  ];
  const lastNames = [
    "Sharma", "Verma", "Singh", "Patel", "Kumar", "Gupta", "Mehta", "Joshi",
    "Nair", "Reddy", "Iyer", "Pillai", "Shah", "Malhotra", "Kapoor", "Bose",
    "Chatterjee", "Mishra", "Pandey", "Yadav", "Tiwari", "Srivastava", "Agarwal", "Bansal",
  ];
  return `${firstNames[randomBetween(0, firstNames.length - 1)]} ${lastNames[randomBetween(0, lastNames.length - 1)]}`;
}

async function main() {
  console.log("🌱 Starting GrowthOS seed...");

  // Clean existing data
  await prisma.communicationEvent.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.segmentMember.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: process.env.DEMO_USER_ID || "demo_user_001",
      email: "demo@growthOS.ai",
      name: "Growth Manager",
    },
  });
  console.log("👤 Created demo user");

  // Generate 500 customers
  const customerData = [];
  const emailSet = new Set<string>();

  for (let i = 0; i < 500; i++) {
    let name = generateName();
    let email = `${name.toLowerCase().replace(/\s+/g, ".")}.${randomBetween(1, 999)}@example.com`;
    while (emailSet.has(email)) {
      email = `${name.toLowerCase().replace(/\s+/g, ".")}.${randomBetween(1, 9999)}@example.com`;
    }
    emailSet.add(email);

    // Create varied customer segments:
    // 30% dormant (last purchase 60-180 days ago)
    // 20% high value (spent > 25000)
    // 20% frequent buyers
    // 15% recent buyers (last 14 days)
    // 15% churn risk (last purchase 31-59 days)
    const segment = i % 20;
    let lastPurchaseDays: number;
    let totalSpent: number;

    if (segment < 6) {
      // Dormant
      lastPurchaseDays = randomBetween(60, 180);
      totalSpent = randomFloat(500, 8000);
    } else if (segment < 10) {
      // High value
      lastPurchaseDays = randomBetween(5, 45);
      totalSpent = randomFloat(25000, 120000);
    } else if (segment < 14) {
      // Frequent
      lastPurchaseDays = randomBetween(1, 20);
      totalSpent = randomFloat(5000, 30000);
    } else if (segment < 17) {
      // Recent
      lastPurchaseDays = randomBetween(1, 14);
      totalSpent = randomFloat(1000, 15000);
    } else {
      // Churn risk
      lastPurchaseDays = randomBetween(31, 59);
      totalSpent = randomFloat(2000, 12000);
    }

    customerData.push({
      name,
      email,
      phone: `+91${randomBetween(7000000000, 9999999999)}`,
      city: CITIES[randomBetween(0, CITIES.length - 1)],
      totalSpent,
      lastPurchaseDate: randomDate(lastPurchaseDays, lastPurchaseDays - 1),
      preferredChannel: CHANNELS[randomBetween(0, CHANNELS.length - 1)],
    });
  }

  const customers = await prisma.$transaction(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );
  console.log(`👥 Created ${customers.length} customers`);

  // Generate 2000 orders across customers
  const orderData = [];
  for (let i = 0; i < 2000; i++) {
    const customer = customers[randomBetween(0, customers.length - 1)];
    const category = PRODUCT_CATEGORIES[randomBetween(0, PRODUCT_CATEGORIES.length - 1)];
    const numItems = randomBetween(1, 4);
    const items = [];
    for (let j = 0; j < numItems; j++) {
      items.push({
        name: category.items[randomBetween(0, category.items.length - 1)],
        quantity: randomBetween(1, 3),
        price: randomFloat(200, 8000),
        category: category.name,
      });
    }
    const amount = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    orderData.push({
      customerId: customer.id,
      amount: parseFloat(amount.toFixed(2)),
      items,
      orderDate: randomDate(180),
    });
  }

  // Batch create orders in chunks of 100
  for (let i = 0; i < orderData.length; i += 100) {
    await prisma.order.createMany({ data: orderData.slice(i, i + 100) });
  }
  console.log(`📦 Created ${orderData.length} orders`);

  // Generate AI-discovered opportunities
  await prisma.opportunity.createMany({
    data: [
      {
        title: "Win Back Dormant Customers",
        description:
          "150 customers haven't purchased in 60+ days but previously had high purchase frequency. Personalized win-back campaign with exclusive discount could recover significant revenue.",
        opportunityScore: 94,
        potentialRevenue: 320000,
        estimatedConversion: 0.12,
        confidenceScore: 0.87,
        segmentCriteria: { inactiveDays: 60, minPreviousOrders: 3 },
        recommendedChannel: "WHATSAPP",
        status: "ACTIVE",
      },
      {
        title: "Upsell High-Value Customers",
        description:
          "82 customers with total spend > ₹25,000 haven't been exposed to premium product lines. Cross-sell premium SKUs to this high-intent segment.",
        opportunityScore: 88,
        potentialRevenue: 450000,
        estimatedConversion: 0.18,
        confidenceScore: 0.91,
        segmentCriteria: { minTotalSpent: 25000, minOrders: 5 },
        recommendedChannel: "EMAIL",
        status: "ACTIVE",
      },
      {
        title: "Reactivate Churn Risk Customers",
        description:
          "120 customers show early churn signals — purchase frequency dropping, last purchase 30-59 days ago. Act now before they go dormant.",
        opportunityScore: 81,
        potentialRevenue: 180000,
        estimatedConversion: 0.09,
        confidenceScore: 0.79,
        segmentCriteria: { inactiveDays: 30, maxInactiveDays: 59 },
        recommendedChannel: "SMS",
        status: "ACTIVE",
      },
      {
        title: "Convert Recent Browsers to Buyers",
        description:
          "95 customers registered in the last 30 days with no purchases yet. Onboarding nudge with first-purchase discount to convert.",
        opportunityScore: 76,
        potentialRevenue: 95000,
        estimatedConversion: 0.22,
        confidenceScore: 0.83,
        segmentCriteria: { newCustomers: true, noPurchase: true },
        recommendedChannel: "WHATSAPP",
        status: "ACTIVE",
      },
      {
        title: "Re-engage Single-Purchase Customers",
        description:
          "210 customers made exactly one purchase 30+ days ago and never returned. Second purchase incentive can turn one-time buyers into loyal customers.",
        opportunityScore: 71,
        potentialRevenue: 210000,
        estimatedConversion: 0.08,
        confidenceScore: 0.74,
        segmentCriteria: { totalOrders: 1, inactiveDays: 30 },
        recommendedChannel: "EMAIL",
        status: "ACTIVE",
      },
    ],
  });
  console.log("💡 Created 5 growth opportunities");

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Users: 1`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Orders: ${orderData.length}`);
  console.log(`   Opportunities: 5`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
