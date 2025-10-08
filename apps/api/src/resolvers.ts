import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    products: async () => prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" }
    }),
    product: async (_: any, { slug }: { slug: string }) =>
      prisma.product.findUnique({ where: { slug } })
  }
};
