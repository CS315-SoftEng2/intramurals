// React and library imports
import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Styles
import styles from "../../assets/styles/leaderboardStyles";
import globalstyles from "../../assets/styles/globalstyles";

// Context and utilities
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

const Leaderboard = () => {
  const { event_name, division, team_name_a, team_name_b, score_a, score_b } =
    useLocalSearchParams();

  const { logout } = useAuth();

  const teams = useMemo(() => {
    const scoreA = parseInt(score_a, 10) || 0;
    const scoreB = parseInt(score_b, 10) || 0;
    const teamBRank = scoreA === scoreB ? 1 : 2;

    return [
      { rank: 1, team: team_name_a, score: scoreA },
      { rank: teamBRank, team: team_name_b, score: scoreB },
    ];
  }, [team_name_a, team_name_b, score_a, score_b]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>{`${event_name} - ${division}`}</Text>

        <View style={styles.leaderboardTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.rankCell]}>Rank</Text>
            <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
            <Text style={[styles.headerCell, styles.scoreCell]}>Score</Text>
          </View>

          {teams.map((item) => (
            <View key={item.rank + item.team} style={styles.tableRow}>
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
