import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";

const LoadingIndicator = ({ visible, message = "Loading..." }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CDD6F4" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </Modal>
  );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
  },
  loadingText: {
    marginTop: 10,
    color: "#CDD6F4",
    fontSize: 16,
  },
});
