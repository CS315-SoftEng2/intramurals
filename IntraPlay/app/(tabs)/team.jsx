// React and library imports
import { useState, useMemo } from "react";
import { Link } from "expo-router";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Components
import SearchIcon from "../../assets/icons/search";
import LoadingIndicator from "../components/LoadingIndicator";

// Styles
import globalstyles from "../../assets/styles/globalstyles";
import styles from "../../assets/styles/teamStyles";

// Queries
import GET_TEAMS from "../../queries/teamsQuery";
import GET_MATCHES from "../../queries/matchesQuery";

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

// MatchCard component
const MatchCard = ({ item, getTeamDetails }) => (
  <View
    style={[
      styles.matchCard,
      { borderColor: item.winner_team_color || "#0000", borderWidth: 1 },
    ]}
  >
    <View style={styles.eventHeader}>
      <Text style={styles.eventName}>{item.event_name}</Text>
      <Text style={styles.divisionText}>{item.division}</Text>
    </View>

    <View style={styles.teamsContainer}>
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

      <View style={styles.scoreContainer}>
        <Text style={styles.vsText}>VS</Text>
        {item.score_a !== null &&
        item.score_b !== null &&
        !(item.score_a === 0 && item.score_b === 0) ? (
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
          Winner: Team{" "}
          {item.winner_team_id === item.team_a_id
            ? item.team_a_name
            : item.team_b_name}
        </Text>
      </View>
    )}
  </View>
);

const Team = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("All Events");

  // Queries
  const { data: teamData, loading: teamLoading } = useQuery(GET_TEAMS);
  const { data: matchData, loading: matchLoading } = useQuery(GET_MATCHES);

  // Memoized data
  const teamsData = useMemo(() => teamData?.teams || [], [teamData]);
  const matchesData = useMemo(() => matchData?.getMatches || [], [matchData]);

  const events = useMemo(() => {
    return [
      "All Events",
      ...new Set(matchesData.map((match) => match.event_name)),
    ];
  }, [matchesData]);

  const filteredMatches = useMemo(() => {
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

    return filtered;
  }, [matchesData, searchQuery, selectedEvent]);

  // Handlers
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

  // Loading state
  if (teamLoading || matchLoading) {
    return <LoadingIndicator visible={true} />;
  }

  return (
    <View style={[globalstyles.container, styles.mainContainer]}>
      {/* Login button */}
      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#22C55E" />
        </Link>
      </View>

      {/* Search and filter */}
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
                color="#111827"
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
              nestedScrollEnabled
              showsVerticalScrollIndicator
              scrollEnabled
              maxToRenderPerBatch={events.length}
              initialNumToRender={events.length}
              windowSize={events.length}
            />
          </View>
        )}
      </View>

      {/* Matches list */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.match_id.toString()}
        renderItem={({ item }) => (
          <MatchCard item={item} getTeamDetails={getTeamDetails} />
        )}
        style={styles.matchesList}
        contentContainerStyle={styles.matchesListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Team;
