import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

function asCart(cart: any) {
  const items = cart.items.map((it: any) => ({
    ...it,
    subtotal: it.unitPrice * it.quantity,
    product: it.product
  }));
  const totalCents = items.reduce((s: number, it: any) => s + it.subtotal, 0);
  const currency = items[0]?.product?.currency ?? "USD";
  return { ...cart, items, totalCents, currency };
}

export const resolvers = {
  Query: {
    products: async () =>
      prisma.product.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
    product: async (_: any, { slug }: { slug: string }) =>
      prisma.product.findUnique({ where: { slug } }),
    cart: async (_: any, { sessionId }: { sessionId: string }) => {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: { include: { product: true } } }
      });
      if (!cart) return { id: "temp", sessionId, items: [], totalCents: 0, currency: "USD" };
      return asCart(cart);
    }
  },

  Mutation: {
    addToCart: async (_: any, { sessionId, productId, sku, qty }: any) => {
      if (qty <= 0) qty = 1;
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const cart = await prisma.cart.upsert({
        where: { sessionId },
        create: { sessionId },
        update: {},
      });

      const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId, sku } });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + qty, unitPrice: product.priceCents }
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, sku, quantity: qty, unitPrice: product.priceCents }
        });
      }

      const fresh = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } }
      });
      return asCart(fresh);
    },

    updateCartItem: async (_: any, { sessionId, itemId, qty }: any) => {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (!cart) throw new Error("Cart not found");
      if (qty <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
      } else {
        await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
      }
      const fresh = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } }
      });
      return asCart(fresh);
    },

    removeCartItem: async (_: any, { sessionId, itemId }: any) => {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (!cart) throw new Error("Cart not found");
      await prisma.cartItem.delete({ where: { id: itemId } });
      const fresh = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } }
      });
      return asCart(fresh);
    },

    clearCart: async (_: any, { sessionId }: any) => {
      const cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (!cart) return { id: "temp", sessionId, items: [], totalCents: 0, currency: "USD" };
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      const fresh = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } }
      });
      return asCart(fresh);
    },

    // NEW: create Stripe Checkout Session and return URL
    checkout: async (_: any, { sessionId }: { sessionId: string }) => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }
      const currency = cart.items[0].product.currency || "USD";

      const line_items = cart.items.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency,
          product_data: { name: it.product.title },
          unit_amount: it.unitPrice, // in cents
        },
      }));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: `${appUrl}/checkout/success?sid=${encodeURIComponent(sessionId)}`,
        cancel_url: `${appUrl}/cart`,
        metadata: { sessionId },
      });

      return { url: session.url as string };
    },
  },
};
