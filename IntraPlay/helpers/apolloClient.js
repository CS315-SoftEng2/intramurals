// Library imports
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

// Utility imports
import storage from "../utils/storage";

// GraphQL API endpoint
const API_ENDPOINT = "http://192.168.1.11:4002/graphql";

// Authentication link to add token to requests
const authLink = new ApolloLink(async (operation, forward) => {
  // Retrieve token from storage
  const token = await storage.getItem("user_token");

  // Add token to request headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  // Forward the operation
  return forward(operation);
});

// Error handling link for GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  // Log GraphQL errors
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  // Log network errors
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// HTTP link for API communication
const httpLink = new HttpLink({ uri: API_ENDPOINT });

// Combine links for Apollo Client
const link = ApolloLink.from([authLink, errorLink, httpLink]);

// Apollo Client configuration
const client1 = new ApolloClient({
  link, // Combined links for requests
  cache: new InMemoryCache(), // In-memory cache for query results
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only", // Always fetch from network
      errorPolicy: "all", // Include all errors in response
    },
    query: {
      fetchPolicy: "network-only", // Always fetch from network
      errorPolicy: "all", // Include all errors in response
    },
    mutate: {
      errorPolicy: "all", // Include–all errors in response
    },
  },
  connectToDevTools: true, // Enable Apollo DevTools
});

// Export Apollo Client instance
export default client1;
