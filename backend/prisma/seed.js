const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("Admin@12345", 10);
  const hashedOwnerPassword = await bcrypt.hash("Owner@12345", 10);
  const hashedUserPassword = await bcrypt.hash("User@12345", 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator Account",
      email: "admin@roxiler.com",
      password: hashedAdminPassword,
      address: "100 Corporate Tech Park, Suite 400, Silicon Valley",
      role: "ADMIN",
    },
  });

  // 2. Create Store Owner
  const owner = await prisma.user.create({
    data: {
      name: "Store Owner Johnathan Doe",
      email: "owner@freshmart.com",
      password: hashedOwnerPassword,
      address: "45 Commercial Boulevard, Central Market District",
      role: "STORE_OWNER",
    },
  });

  // 3. Create Normal User
  const user = await prisma.user.create({
    data: {
      name: "Paras Regular Shopper User",
      email: "user@example.com",
      password: hashedUserPassword,
      address: "123 Greenfield Residency, Apartment 4B",
      role: "USER",
    },
  });

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: "FreshMart Supermarket Chain",
      email: "contact@freshmart.com",
      address: "45 Commercial Boulevard, Central Market District",
      ownerId: owner.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Apex Electronics & Gadgets Hub",
      email: "support@apexelectronics.com",
      address: "88 Tech Hub Avenue, North Block, City Center",
      ownerId: null,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: "Green Valley Organic Groceries",
      email: "hello@greenvalley.com",
      address: "12 Eco Park Road, South City Greenfield",
      ownerId: null,
    },
  });

  // 5. Create Sample Ratings
  await prisma.rating.create({
    data: {
      rating: 5,
      userId: user.id,
      storeId: store1.id,
    },
  });

  await prisma.rating.create({
    data: {
      rating: 4,
      userId: user.id,
      storeId: store2.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
