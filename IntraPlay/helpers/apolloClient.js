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
const API_ENDPOINT = "http://192.168.1.12:4002/graphql";

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
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// HTTP link for API communication
const httpLink = new HttpLink({ uri: API_ENDPOINT });

// Combine links for Apollo Client
const link = ApolloLink.from([authLink, errorLink, httpLink]);

// Apollo Client configuration
const client1 = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  connectToDevTools: true,
});

export default client1;
