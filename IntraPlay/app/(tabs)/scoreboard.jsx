import { Link } from "expo-router";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Scoreboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginBottonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Scoreboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  loginBottonContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "right",
    position: "absolute",
    left: 320,
    top: 15,
  },
});
