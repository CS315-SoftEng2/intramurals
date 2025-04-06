import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, SafeAreaView, Image, TextInput, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Font from "expo-font";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
      });
      setFontsLoaded(true); 
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const handleLogin = () => {
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['rgba(30, 58, 138, 0.1)', 'rgba(34, 197, 94, 0.9)']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.backImage1}>
          <Image
            source={require('../assets/images/sparkle.png')}
            style={styles.sparkleImage1}
          />
        </View>

        <View style={styles.backImage2}>
          <Image
            source={require('../assets/images/sparkle.png')}
            style={styles.sparkleImage2}
          />
        </View>

        <View style={styles.logoDiv}>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        </View>

        <View style={styles.loginMessageContainer}>
          <Text style={styles.loginLabel}>Login!</Text>
          <Text style={styles.loginMessage}>Game Time! Sign in to track your teams and stats</Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.inputField}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#fff"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordField}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#fff"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.backImage3}>
          <Image
            source={require('../assets/images/sparkle.png')}
            style={styles.sparkleImage3} 
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 30,
    position: 'relative',
  },
  logoDiv: {
    alignItems: 'center',
    paddingTop: 25,
  },
  logo: {
    width: 100,
    height: 100,
  },
  loginContainer: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#fff',
    fontFamily: 'Rubik-Regular',
  },
  inputField: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  passwordField: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#fff',
  },
  eyeIcon: {
    padding: 8,
    justifyContent: 'center',
  },
  loginMessageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loginLabel: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Rubik-Medium',
  },
  loginMessage: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Rubik-Light',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backImage1: {
    position: 'absolute',
    top: -15, 
    left: -30, 
    width: 130,
    height: 130,
    zIndex: 1, 
  },
  sparkleImage1: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  backImage2: {
    position: 'absolute',
    top: -60, 
    left: 130, 
    width: 130,
    height: 130,
    zIndex: 0, 
  },
  sparkleImage2: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  backImage3: {
    position: 'absolute',
    top: 350, 
    left: -120, 
    width: 130,
    height: 130,
    zIndex: 0, 
  },
  sparkleImage3: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
});