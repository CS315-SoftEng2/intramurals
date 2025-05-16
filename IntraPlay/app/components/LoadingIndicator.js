// React and library imports
import { View, Text, ActivityIndicator, Modal } from "react-native";

//Styles
import styles from "../../assets/styles/loadingIndicatorStyles";

// LoadingIndicator component for displaying a loading state
const LoadingIndicator = ({ visible, message = "Loading..." }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      {/*Container for loading indicator and message*/}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CDD6F4" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </Modal>
  );
};

export default LoadingIndicator;
