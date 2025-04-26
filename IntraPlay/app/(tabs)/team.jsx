import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import globalstyles from "../../assets/styles/globalstyles";
import { useState, useEffect } from "react";
import SearchIcon from "../../assets/icons/search";
import { useQuery } from "@apollo/client";
import GET_TEAMS from "../../queries/teamsQuery";
import GET_MATCHES from "../../queries/matchesQuery";

const teamLogos = {
  "team1.png": require("../../assets/images/team1.png"),
  "team2.png": require("../../assets/images/team2.png"),
  "team3.png": require("../../assets/images/team3.png"),
};

const getTeamLogo = (filename) => {
  if (!filename) return require("../../assets/images/default_logo.png");

  const cleaned = filename.trim().toLowerCase();
  const localImage = teamLogos[cleaned];

  if (!localImage) {
    console.warn(`Logo not found for: ${cleaned}`);
  }

  return localImage || require("../../assets/images/default_logo.png");
};

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);

  const { data: teamData } = useQuery(GET_TEAMS);
  const { data: matchData } = useQuery(GET_MATCHES);

  const teamsData = teamData?.teams || [];
  const matchesData = matchData?.getMatches || [];

  const events = [
    "All Events",
    ...Array.from(new Set(matchesData.map((match) => match.event_name))),
  ];

  useEffect(() => {
    if (matchesData.length > 0) {
      setMatches(matchesData);
      setFilteredMatches(matchesData);
    }
  }, [matchesData]);

  useEffect(() => {
    let filtered = matchesData;

    if (searchQuery) {
      filtered = filtered.filter(
        (match) =>
          match.team_a_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.team_b_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.division.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedEvent !== "All Events") {
      filtered = filtered.filter((match) => match.event_name === selectedEvent);
    }

    setFilteredMatches(filtered);
  }, [searchQuery, selectedEvent, matches]);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDropdownVisible(false);
  };

  const getTeamDetails = (teamId) => {
    return teamsData.find((team) => team.team_id === teamId) || {};
  };

  const renderMatchCard = ({ item }) => {
    return (
      <View
        style={[
          styles.matchCard,
          { borderColor: item.winner_team_color, borderWidth: 1 },
        ]}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventName}>{item.event_name}</Text>
          <Text style={styles.divisionText}>{item.division}</Text>
        </View>

        <View style={styles.teamsContainer}>
          {/* Team A */}
          <View style={styles.teamContainer}>
            <Image
              style={styles.teamCircle}
              source={getTeamLogo(item.team_a_logo)}
            />
            <Text style={styles.teamName}>Team {item.team_a_name}</Text>
            <Text style={styles.teamMotto}>
              {getTeamDetails(item.team_a_id).team_motto || ""}
            </Text>
          </View>

          {/* VS and Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.vsText}>VS</Text>
            {item.score_a !== null && item.score_b !== null ? (
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>
                  {item.score_a} - {item.score_b}
                </Text>
              </View>
            ) : (
              <View style={styles.upcomingBox}>
                <Text style={styles.upcomingText}>Upcoming</Text>
              </View>
            )}
          </View>

          {/* Team B */}
          <View style={styles.teamContainer}>
            <Image
              style={styles.teamCircle}
              source={getTeamLogo(item.team_b_logo)}
            />
            <Text style={styles.teamName}>Team {item.team_b_name}</Text>
            <Text style={styles.teamMotto}>
              {getTeamDetails(item.team_b_id).team_motto || ""}
            </Text>
          </View>
        </View>

        {item.winner_team_id && (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerText}>
              Winner:{" Team "}
              {item.winner_team_id === item.team_a_id
                ? item.team_a_name
                : item.team_b_name}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[globalstyles.container, styles.mainContainer]}>
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputField}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search team, event, division..."
              placeholderTextColor="grey"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.dropDownButton}
            onPress={toggleDropdown}
          >
            <View style={styles.dropdownButtonContent}>
              <Text style={styles.dropDownButtonText}>{selectedEvent}</Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={15}
                color="#fff"
                style={styles.dropdownIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {isDropdownVisible && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={events}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectEvent(item)}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              maxToRenderPerBatch={events.length}
              initialNumToRender={events.length}
              windowSize={events.length}
            />
          </View>
        )}
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.match_id.toString()}
        renderItem={renderMatchCard}
        style={styles.matchesList}
        contentContainerStyle={styles.matchesListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Team;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
    marginTop: 50,
    paddingHorizontal: 15,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  searchInputField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    width: "65%",
    height: 40,
    backgroundColor: "#2A2A3C",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    marginLeft: 5,
  },
  dropDownButton: {
    backgroundColor: "#2A2A3C",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "33%",
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dropDownButtonText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 3,
  },
  dropdownIcon: {
    marginLeft: 2,
  },
  dropdownContainer: {
    position: "absolute",
    top: 45,
    right: 15,
    width: "33%",
    backgroundColor: "#2A2A3C",
    borderRadius: 5,
    zIndex: 10,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 14,
  },
  matchesList: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    zIndex: 0,
  },
  matchesListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: "#2A2A3C",
    borderRadius: 10,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  eventName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divisionText: {
    color: "#ccc",
    fontSize: 12,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  teamContainer: {
    alignItems: "center",
    width: "40%",
  },
  teamCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  teamInitial: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  teamMotto: {
    color: "#ccc",
    fontSize: 9,
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    width: "20%",
  },
  vsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scoreBox: {
    backgroundColor: "#444",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  scoreText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  upcomingBox: {
    backgroundColor: "#444",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  upcomingText: {
    color: "#7dabf5",
    fontSize: 10,
    fontWeight: "bold",
  },
  winnerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  winnerText: {
    color: "#7df57d",
    fontSize: 14,
    fontWeight: "bold",
  },
});
