import { GraphQLClient, gql } from "graphql-request";

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
        {products.map(p => (
          <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            {p.mainImageUrl && <img src={p.mainImageUrl} alt={p.title} style={{ width: "100%", borderRadius: 8 }} />}
            <h3 style={{ marginBottom: 4 }}>{p.title}</h3>
            <p style={{ marginTop: 0, color: "#555" }}>{p.description}</p>
            <strong>{(p.priceCents/100).toFixed(2)} {p.currency}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
