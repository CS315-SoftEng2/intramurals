import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import USER_UPDATE_SCORE from "../../../mutations/userUpdateScoreMutation";
import GET_TEAMS from "../../../queries/teamsQuery";
import GET_MATCHES from "../../../queries/matchesQuery";
import globalstyles from "@/assets/styles/globalstyles";
import Toast from "react-native-toast-message";

const ScoreUpdate = () => {
  const router = useRouter();
  const {
    match_id,
    event_name,
    division,
    team_a_id,
    team_b_id,
    user_assigned_id,
  } = useLocalSearchParams();

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [updateScore] = useMutation(USER_UPDATE_SCORE);
  const { data: teamData } = useQuery(GET_TEAMS);
  const { data: matchesData, loading: matchesLoading } = useQuery(GET_MATCHES);

  useEffect(() => {
    if (matchesData?.getMatches && match_id) {
      const match = matchesData.getMatches.find(
        (m) => m.match_id === Number(match_id)
      );

      if (match) {
        setScoreA(match.score_a || 0);
        setScoreB(match.score_b || 0);
      }
    }
  }, [matchesData, match_id]);

  const handleSubmit = async () => {
    const variables = {
      match: { score_a: Number(scoreA), score_b: Number(scoreB) },
      userId: Number(user_assigned_id),
      matchId: Number(match_id),
    };
    try {
      const { data } = await updateScore({
        variables,
        update: (cache, { data: { userUpdateScore } }) => {
          if (userUpdateScore.type === "success" && userUpdateScore.match) {
            const existingMatches = cache.readQuery({ query: GET_MATCHES });
            if (existingMatches) {
              const updatedMatches = existingMatches.getMatches.map((match) =>
                match.match_id === Number(match_id)
                  ? {
                      ...match,
                      score_a: userUpdateScore.match.score_a,
                      score_b: userUpdateScore.match.score_b,
                    }
                  : match
              );
              cache.writeQuery({
                query: GET_MATCHES,
                data: { getMatches: updatedMatches },
              });
            }
          }
        },
        refetchQueries: [{ query: GET_MATCHES }],
      });

      if (data.userUpdateScore.type === "success") {
        Toast.show({
          type: "success",
          text1: "Score Updated",
          text2: data.userUpdateScore.message,
        });

        const teamNameA = teamName(team_a_id);
        const teamNameB = teamName(team_b_id);

        router.replace({
          pathname: "/(user)/leaderboard",
          params: {
            match_id,
            event_name,
            division,
            team_name_a: teamNameA,
            team_name_b: teamNameB,
            score_a: scoreA,
            score_b: scoreB,
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Update failed!",
          text2: data.userUpdate.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Update failed!",
        text2: err.message,
      });
    }
  };

  const teamName = (id) =>
    teamData?.teams?.find((team) => team.team_id == id)?.team_name || "Unknown";

  return (
    <ScrollView style={{ backgroundColor: "#1E1E2E" }}>
      <View style={globalstyles.loginButtonContainer}>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>
          {event_name} - {division}
        </Text>

        <View style={styles.scoreCard}>
          <Text style={styles.vsText}>
            {teamName(team_a_id)} vs {teamName(team_b_id)}
          </Text>

          <View style={styles.teamScoreRow}>
            <View style={styles.teamColumn}>
              <Text style={styles.teamTitle}>Team {teamName(team_a_id)}</Text>
              <View style={styles.scoreButtons}>
                <TouchableOpacity
                  onPress={() => scoreA > 0 && setScoreA(scoreA - 1)}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={30}
                    color="#FB0707"
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.scoreNumber}
                  value={String(scoreA)}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const parsed = parseInt(text) || 0;
                    setScoreA(parsed);
                  }}
                />
                <TouchableOpacity onPress={() => setScoreA(scoreA + 1)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={30}
                    color="#0EF061"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.teamColumn}>
              <Text style={styles.teamTitle}>Team {teamName(team_b_id)}</Text>
              <View style={styles.scoreButtons}>
                <TouchableOpacity
                  onPress={() => scoreB > 0 && setScoreB(scoreB - 1)}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={30}
                    color="#FB0707"
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.scoreNumber}
                  value={String(scoreB)}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const parsed = parseInt(text) || 0;
                    setScoreB(parsed);
                  }}
                />
                <TouchableOpacity onPress={() => setScoreB(scoreB + 1)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={30}
                    color="#0EF061"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ScoreUpdate;

const styles = StyleSheet.create({
  contentContainer: {
    top: 25,
    padding: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "left",
  },
  scoreCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 15,
    padding: 20,
  },
  vsText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  teamScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: "center",
    width: "45%",
  },
  teamTitle: {
    color: "#ccc",
    marginBottom: 5,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 15,
  },
  scoreButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    fontSize: 24,
    marginHorizontal: 10,
    color: "#22C55E",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
