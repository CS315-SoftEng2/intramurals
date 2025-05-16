// React and library imports
import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

// Context and helper imports
import { AuthProvider } from "../context/AuthContext";
import { DimensionsProvider } from "../context/DimensionsContext";
import client1 from "../helpers/apolloClient";

// Component imports
import LoadingIndicator from "./components/LoadingIndicator";

// Configuration imports
import toastConfig from "./components/toastConfig";

// RootLayout component for app navigation and context setup
export default function RootLayout() {
  // State to track app readiness
  const [isReady, setIsReady] = useState(false);

  // Set app as ready on mount
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Show loading indicator until app is ready
  if (!isReady) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    // Apollo provider for GraphQL client
    <ApolloProvider client={client1}>
      {/*Authentication context provider*/}
      <AuthProvider>
        {/*Dimensions context provider*/}
        <DimensionsProvider>
          {/*Navigation stack with hidden headers*/}
          <Stack screenOptions={{ headerShown: false }}>
            {/*Main screens*/}
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(admin)" />
          </Stack>
          {/*Toast notification component*/}
          <Toast config={toastConfig} position="top" topOffset={50} />
        </DimensionsProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
