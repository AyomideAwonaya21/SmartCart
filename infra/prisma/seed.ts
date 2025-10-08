import { PrismaClient } from "@prisma/client";
import { slugify } from "../../packages/types/slugify";

const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: "featured" },
    create: { name: "Featured", slug: "featured" },
    update: {}
  });

  const products = [
    { title: "Aurora Hoodie", description: "Soft fleece hoodie.", priceCents: 6900 },
    { title: "Nimbus Sneakers", description: "Lightweight running shoes.", priceCents: 12900 },
    { title: "Zephyr Cap", description: "Breathable cap.", priceCents: 2900 }
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug: slugify(p.title),
        description: p.description,
        priceCents: p.priceCents,
        status: "PUBLISHED",
        mainImageUrl: "https://picsum.photos/seed/" + slugify(p.title) + "/640/480",
        categories: { create: { categoryId: cat.id } },
        inventory: { create: { sku: slugify(p.title).toUpperCase(), quantity: 20 } }
      }
    });
    console.log("Seeded:", product.title);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
