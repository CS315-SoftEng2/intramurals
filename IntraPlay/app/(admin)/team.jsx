// React and library imports
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

// Components
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/customAlert";

// Styles
import styles from "../../assets/styles/adminTeamStyles";
import globalstyles from "../../assets/styles/globalstyles";

// Queries and mutations
import GET_TEAMS from "../../queries/teamsQuery";
import {
  ADD_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
} from "../../mutations/teamMutation";

// Context and utilities
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

// Team logos
const teamLogos = {
  "team1.png": require("../../assets/images/team1.png"),
  "team2.png": require("../../assets/images/team2.png"),
  "team3.png": require("../../assets/images/team3.png"),
};

// Utility function for team logo
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
const TeamItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.teamInfo}>
        <Image
          style={styles.avatarContainer}
          source={getTeamLogo(item.team_logo)}
        />
        <View style={styles.teamTextInfo}>
          <Text style={styles.teamName}>{item.team_name}</Text>
          <Text style={styles.teamId}>Team ID: {item.team_id}</Text>
          {item.team_motto && (
            <Text style={styles.teamMotto}>"{item.team_motto}"</Text>
          )}
        </View>
      </View>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEdit(item)}
      >
        <MaterialIcons name="edit" size={16} color="#1E88E5" />
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => onDelete(item.team_id)}
      >
        <MaterialIcons name="delete" size={16} color="#F38BA8" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Teams = () => {
  // Context
  const { logout } = useAuth();

  // Queries and mutations
  const { loading, error, data, refetch } = useQuery(GET_TEAMS);
  const [addTeam] = useMutation(ADD_TEAM);
  const [updateTeam] = useMutation(UPDATE_TEAM);
  const [deleteTeam] = useMutation(DELETE_TEAM);

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState(null);
  const [formData, setFormData] = useState({
    team_name: "",
    team_color: "",
    team_logo: "",
    team_motto: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Memoized filtered and sorted teams
  const filteredAndSortedTeams = useMemo(() => {
    if (!data || !data.teams) return [];

    let filteredTeams = data.teams.filter(Boolean);

    if (searchQuery) {
      filteredTeams = filteredTeams.filter(
        (team) =>
          team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (team.team_color &&
            team.team_color
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (team.team_motto &&
            team.team_motto
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          team.team_id.toString().includes(searchQuery)
      );
    }

    return [...filteredTeams].sort((a, b) =>
      sortOrder === "asc" ? a.team_id - b.team_id : b.team_id - a.team_id
    );
  }, [data, searchQuery, sortOrder]);

  // Handlers
  const handleSubmit = async () => {
    if (!formData.team_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Team name cannot be empty.",
      });
      return;
    }

    if (!formData.team_color.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Team color cannot be empty.",
      });
      return;
    }

    const variables = {
      team: {
        team_name: formData.team_name,
        team_color: formData.team_color,
        team_logo: formData.team_logo,
        team_motto: formData.team_motto,
      },
      adminId: 1,
    };

    try {
      if (editMode) {
        const { data: updateData } = await updateTeam({
          variables: { ...variables, teamId: editTeamId },
        });
        Toast.show({
          type: updateData.updateTeam.type.toLowerCase(),
          text1: updateData.updateTeam.message,
        });
      } else {
        const { data: addData } = await addTeam({ variables });
        Toast.show({
          type: addData.addTeam.type.toLowerCase(),
          text1: addData.addTeam.message,
        });
      }
      refetch();
      setModalVisible(false);
      setFormData({
        team_name: "",
        team_color: "",
        team_logo: "",
        team_motto: "",
      });
      setEditMode(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    }
  };

  const handleDelete = (teamId) => {
    setDeleteTeamId(teamId);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const { data: deleteData } = await deleteTeam({
        variables: { adminId: 1, teamId: deleteTeamId },
      });
      Toast.show({
        type: deleteData.deleteTeam.type.toLowerCase(),
        text1: deleteData.deleteTeam.message,
      });
      refetch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    } finally {
      setAlertVisible(false);
      setDeleteTeamId(null);
    }
  };

  const handleEdit = (team) => {
    setFormData({
      team_name: team.team_name,
      team_color: team.team_color || "",
      team_logo: team.team_logo || "",
      team_motto: team.team_motto || "",
    });
    setEditMode(true);
    setEditTeamId(team.team_id);
    setModalVisible(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const openAddTeamModal = () => {
    setFormData({
      team_name: "",
      team_color: "",
      team_logo: "",
      team_motto: "",
    });
    setEditMode(false);
    setModalVisible(true);
  };

  // Loading state
  if (loading) return <LoadingIndicator visible={true} message="Loading..." />;

  // Error state
  if (error)
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={60} color="#F38BA8" />
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Logout button */}
      <View style={globalstyles.loginButtonContainer}>
        <TouchableOpacity onPress={() => handleLogout(logout)}>
          <MaterialIcons name="logout" size={25} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Team Management</Text>
        <Text style={styles.subtitle}>
          {filteredAndSortedTeams.length} team
          {filteredAndSortedTeams.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Search and actions */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="grey" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            placeholderTextColor="grey"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#A6ADC8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
            <MaterialIcons
              name={sortOrder === "asc" ? "arrow-upward" : "arrow-downward"}
              size={18}
              color="#1A7F3C"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={openAddTeamModal} style={styles.addButton}>
            <MaterialIcons
              name="group-add"
              size={18}
              color="#FFFFFF"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.addButtonText}>Add Team</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Team list */}
      {filteredAndSortedTeams.length > 0 ? (
        <FlatList
          data={filteredAndSortedTeams}
          renderItem={({ item }) => (
            <TeamItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          keyExtractor={(item) => item.team_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="groups" size={60} color="#45475A" />
          <Text style={styles.noDataText}>
            {searchQuery ? "No teams match your search" : "No teams found"}
          </Text>
        </View>
      )}

      {/* Add/Edit team modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Team" : "Add New Team"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalDivider} />

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Team Name</Text>
            <TextInput
              placeholder="Enter team name"
              value={formData.team_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_name: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Team Color</Text>
            <TextInput
              placeholder="Enter a color or hex color code (#RRGGBB)"
              value={formData.team_color}
              onChangeText={(text) =>
                setFormData({ ...formData, team_color: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Team Logo URL (Optional)</Text>
            <TextInput
              placeholder="Enter logo URL"
              value={formData.team_logo}
              onChangeText={(text) =>
                setFormData({ ...formData, team_logo: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Team Motto (Optional)</Text>
            <TextInput
              placeholder="Enter team motto"
              value={formData.team_motto}
              onChangeText={(text) =>
                setFormData({ ...formData, team_motto: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
              multiline
            />
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Team" : "Create Team"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team?"
      />
    </SafeAreaView>
  );
};

export default Teams;
