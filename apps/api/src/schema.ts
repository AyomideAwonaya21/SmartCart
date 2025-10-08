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

  type Query {
    products: [Product!]!
    product(slug: String!): Product
  }
`;
