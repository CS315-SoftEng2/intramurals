import { Link } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import styles from "../../assets/styles/leaderboardStyles";
import globalstyles from "../../assets/styles/globalstyles";

const Leaderboard = () => {
  const { event_name, division, team_name_a, team_name_b, score_a, score_b } =
    useLocalSearchParams();

  const teams = [
    { rank: 1, team: team_name_a, score: score_a },
    { rank: 2, team: team_name_b, score: score_b },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>{`${event_name} - ${division}`}</Text>

        <View style={styles.leaderboardTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.rankCell]}>Rank</Text>
            <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
            <Text style={[styles.headerCell, styles.scoreCell]}>Score</Text>
          </View>

          {teams.map((item) => (
            <View key={item.rank} style={styles.tableRow}>
              <Text style={[styles.cell, styles.rankCell]}>{item.rank}</Text>
              <Text style={[styles.cell, styles.teamCell]}>{item.team}</Text>
              <Text style={[styles.cell, styles.scoreCell]}>{item.score}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Leaderboard;
