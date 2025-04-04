import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

const Index = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.div}>
        <Text style={styles.text}>Hello World!</Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2E",
  },
  div: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 30,
    color: "white", 
  },
});
