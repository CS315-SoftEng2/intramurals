import { Link } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Font from "expo-font";
import { useState, useEffect } from 'react';

const Index = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Oswald-Semi-Bold": require("../../assets/fonts/oswald-semi-bold.ttf"),
        "Racing Sans One-Regular": require("../../assets/fonts/RacingSansOne-Regular.ttf"),
      });
      setFontsLoaded(true); 
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <Text style={styles.headerTitleUpcomingEvents}>Upcoming Events</Text>

      <View style={styles.upcomingEventsContainer}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Upcoming events will go here!!!
        </Text>

        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitleLeadingTeam}>Leading Team</Text>

      <View style={styles.leadingTeamContainer}>
        <Image
          source={require('../../assets/images/team1.png')}
          style={styles.team1Logo}
        />
        <Text style={styles.totalScoreLabel}>TOTAL SCORE</Text>
        <Text style={styles.totalScoreValue}>350</Text>
      </View>

      <Text style={styles.headerTitleOngoingMatches}>Ongoing Matches</Text>

      <View style={styles.justNowContainer}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Just in events will go here!!!
        </Text>
      </View>

      <Text style={styles.headerTitleJustNow}>Just Now</Text>

      <View style={styles.justNowContainer}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          On going matches will go here!!!
        </Text>
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    backgroundColor: '#1E1E2E',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },
  loginButtonContainer: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
  },
  headerTitleUpcomingEvents: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    alignSelf: 'left',
    textAlign: 'left',
    marginLeft: 25,
  },
  headerTitleLeadingTeam: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    alignSelf: 'left',
    textAlign: 'left',
    marginLeft: 25,
  },
  headerTitleJustNow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 25,
    marginLeft: 25,
    alignSelf: 'left',
    textAlign: 'left',
  },
  headerTitleOngoingMatches: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginLeft: 25,
    alignSelf: 'left',
    textAlign: 'left',
  },
  upcomingEventsContainer: {
    backgroundColor: 'rgba(173, 216, 230, 0.15)',
    height: 150,
    width: 310,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    top: 40,
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  leadingTeamContainer: {
    height: 90,
    width: 310,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  team1Logo: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginLeft: 50,
    alignSelf: 'left',
  },
  totalScoreLabel: {
    fontFamily: 'Oswald-Semi-Bold',
    fontSize: 18,
    color: '#fff',
    alignSelf: 'left',
    textAlign: 'right',
    marginRight: 50,
    marginBottom: -5,
    position: 'relative',
    zIndex: 100,
    top: -80,
  },
  totalScoreValue: {
    fontFamily: 'Racing Sans One-Regular',
    fontSize: 50,
    color: '#fff',
    alignSelf: 'left',
    textAlign: 'right',
    marginRight: 50,
    marginBottom: -5,
    position: 'relative',
    zIndex: 100,
    top: -85,
  },
  justNowContainer: {
    backgroundColor: 'rgba(173, 216, 230, 0.15)',
    height: 72,
    width: 310,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
