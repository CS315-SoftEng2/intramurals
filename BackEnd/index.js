import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema/schema.js";
import { resolvers } from "./resolvers/resolvers.js";
import appContext from "../BackEnd/helpers/contextHandler.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    context: appContext,
    listen: { port: 4002 },
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
};

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
