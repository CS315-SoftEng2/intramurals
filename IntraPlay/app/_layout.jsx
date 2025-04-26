import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client";
import { AuthProvider } from "../context/AuthContext";
import client1 from "../helpers/apolloClient";
import { useEffect, useState } from "react";
import { DimensionsProvider } from "../context/DimensionsContext";
import Toast from "react-native-toast-message";
import toastConfig from "./components/toastConfig";
import LoadingIndicator from "./components/LoadingIndicator";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    <ApolloProvider client={client1}>
      <AuthProvider>
        <DimensionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(admin)" />
          </Stack>
          <Toast config={toastConfig} position="top" topOffset={50} />
        </DimensionsProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
