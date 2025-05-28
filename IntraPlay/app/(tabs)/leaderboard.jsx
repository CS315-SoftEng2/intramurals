// React and library imports
import { useMemo } from "react";
import { View, Text, FlatList, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";

// Styles
import globalstyles from "../../assets/styles/globalstyles";
import styles from "../../assets/styles/userLeaderboardStyles";

// Components
import LoadingIndicator from "../components/LoadingIndicator";

// Queries
import GET_LEADING_TEAM from "../../queries/getLeadingTeamQuery";

// Apollo Client
import { useQuery } from "@apollo/client";

// Team logos
const teamLogos = {
  "team1.png": require("../../assets/images/team1.png"),
  "team2.png": require("../../assets/images/team2.png"),
  "team3.png": require("../../assets/images/team3.png"),
};

// Utility functions
const getTeamLogo = (filename) => {
  if (!filename) return require("../../assets/images/default_logo.png");
  const cleaned = filename.trim().toLowerCase();
  const localImage = teamLogos[cleaned];
  if (!localImage) {
    console.warn(`Logo not found for: ${cleaned}`);
  }
  return localImage || require("../../assets/images/default_logo.png");
};

// TeamItem component
const TeamItem = ({ item, index }) => {
  const isTopThree = item.adjusted_ranking <= 3;
  const rankColor = isTopThree
    ? item.adjusted_ranking === 1
      ? "#FFD700" // Gold for rank 1
      : item.adjusted_ranking === 2
      ? "#C0C0C0" // Silver for rank 2
      : "#CD7F32" // Bronze for rank 3
    : "#fff";

  return (
    <View
      style={[styles.teamCard, { borderColor: item.team_color || "#22C55E" }]}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: rankColor }]}>
          {item.adjusted_ranking}
        </Text>
        {isTopThree && (
          <MaterialIcons
            name={item.adjusted_ranking === 1 ? "emoji-events" : "star"}
            size={20}
            color={rankColor}
            style={styles.rankIcon}
          />
        )}
      </View>
      <Image style={styles.teamLogo} source={getTeamLogo(item.team_logo)} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.team_name}</Text>
        <Text style={styles.scoreText}>Total Score: {item.total_score}</Text>
      </View>
    </View>
  );
};

const Leaderboard = () => {
  // Queries
  const { data, loading, error } = useQuery(GET_LEADING_TEAM);

  // Memoized team scores with adjusted rankings
  const teamScores = useMemo(() => {
    if (!data?.teamScores) return [];

    // Sort teams by total_score in descending order
    const sortedTeams = [...data.teamScores].sort(
      (a, b) => b.total_score - a.total_score
    );

    // Find the highest score
    const topScore = sortedTeams[0]?.total_score || 0;

    // Assign adjusted rankings: rank 1 for all teams with the top score
    let currentRank = 1;
    let lastScore = null;

    return sortedTeams.map((team, index) => {
      if (team.total_score === topScore) {
        // All teams with the top score get rank 1
        return { ...team, adjusted_ranking: 1 };
      } else {
        // For non-top scores, increment rank only when score changes
        if (team.total_score !== lastScore) {
          currentRank = index + 1;
        }
        lastScore = team.total_score;
        return { ...team, adjusted_ranking: currentRank };
      }
    });
  }, [data]);

  // Check if all teams have zero scores
  const allScoresZero =
    teamScores.length > 0 && teamScores.every((team) => team.total_score === 0);

  // Loading state
  if (loading) {
    return <LoadingIndicator visible={true} />;
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
        <MaterialIcons
          name="leaderboard"
          size={30}
          color="#fff"
          style={styles.icon}
        />
      </View>

      {/* Check for zero scores */}
      {allScoresZero ? (
        <View style={styles.noScoresContainer}>
          <Text style={styles.noScoresText}>
            No scores yet! Teams are still warming up.
          </Text>
        </View>
      ) : (
        /* Team list */
        <FlatList
          data={teamScores}
          keyExtractor={(item) => item.team_id.toString()}
          renderItem={({ item, index }) => (
            <TeamItem item={item} index={index} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Leaderboard;
