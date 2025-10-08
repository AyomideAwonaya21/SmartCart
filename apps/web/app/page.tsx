import { GraphQLClient, gql } from "graphql-request";
import ProductCard from "./components/ProductCard";

const client = new GraphQLClient("http://localhost:4000/graphql");

const ProductsQuery = gql/* GraphQL */`
  query Products { products { id title slug description priceCents currency mainImageUrl } }
`;

export default async function HomePage() {
  const { products } = await client.request<{ products: any[] }>(ProductsQuery);
  return (
    <div>
      <h1>Products</h1>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </ul>
      <p style={{ marginTop: 24 }}>
        <a href="/cart">Go to cart →</a>
      </p>
    </div>
  );
}
