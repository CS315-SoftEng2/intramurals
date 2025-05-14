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
  const isTopThree = index < 3;
  const rankColor = isTopThree
    ? index === 0
      ? "#FFD700"
      : index === 1
      ? "#C0C0C0"
      : "#CD7F32"
    : "#fff";

  return (
    <View
      style={[styles.teamCard, { borderColor: item.team_color || "#22C55E" }]}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: rankColor }]}>
          {item.overall_ranking}
        </Text>
        {isTopThree && (
          <MaterialIcons
            name={index === 0 ? "emoji-events" : "star"}
            size={20}
            color={rankColor}
            style={styles.rankIcon}
          />
        )}
      </View>
      <Image style={styles.teamLogo} source={getTeamLogo(item.team_logo)} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.team_name}</Text>
        <Text style={styles.scoreText}>Score: {item.total_score}</Text>
      </View>
    </View>
  );
};

const Leaderboard = () => {
  // Queries
  const { data, loading, error } = useQuery(GET_LEADING_TEAM);

  // Memoized team scores
  const teamScores = useMemo(() => {
    return data?.teamScores || [];
  }, [data]);

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
      {/* Login button */}
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

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

      {/* Team list */}
      <FlatList
        data={teamScores}
        keyExtractor={(item) => item.team_id.toString()}
        renderItem={({ item, index }) => <TeamItem item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Leaderboard;
