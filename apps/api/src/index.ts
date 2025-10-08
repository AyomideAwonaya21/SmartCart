import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const app = express();

// Allow your Next.js dev app(s)
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

async function bootstrap() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // We already applied CORS via Express above — disable Apollo's own CORS layer
  server.applyMiddleware({ app, path: "/graphql", cors: false });

  const port = Number(process.env.PORT) || 4000;

  // Listen on all interfaces so localhost/127.0.0.1 both work
  app.listen(port, "0.0.0.0", () => {
    console.log(`API ready on http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
