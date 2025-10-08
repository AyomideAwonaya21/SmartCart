import { gql } from "apollo-server-express";

export const typeDefs = gql/* GraphQL */`
  type Product {
    id: ID!
    title: String!
    slug: String!
    description: String!
    priceCents: Int!
    currency: String!
    mainImageUrl: String
  }

  type CartItem {
    id: ID!
    product: Product!
    sku: String!
    quantity: Int!
    unitPrice: Int!
    subtotal: Int!
  }

  type Cart {
    id: ID!
    sessionId: ID!
    items: [CartItem!]!
    totalCents: Int!
    currency: String!
  }

  type Query {
    products: [Product!]!
    product(slug: String!): Product
    cart(sessionId: ID!): Cart
  }

  type Mutation {
    addToCart(sessionId: ID!, productId: ID!, sku: String!, qty: Int!): Cart
    updateCartItem(sessionId: ID!, itemId: ID!, qty: Int!): Cart
    removeCartItem(sessionId: ID!, itemId: ID!): Cart
    clearCart(sessionId: ID!): Cart
  }
`;
