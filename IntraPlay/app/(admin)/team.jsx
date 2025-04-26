import { useMutation, useQuery } from "@apollo/client";
import { Link } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import LoadingIndicator from "../components/LoadingIndicator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useMemo } from "react";
import Modal from "react-native-modal";
import globalstyles from "../../assets/styles/globalstyles";
import GET_TEAMS from "../../queries/teamsQuery";
import {
  ADD_TEAM,
  UPDATE_TEAM,
  DELETE_TEAM,
} from "../../mutations/teamMutation";
import Toast from "react-native-toast-message";
import CustomAlert from "../components/customAlert";

const { width } = Dimensions.get("window");

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
        <MaterialIcons name="edit" size={16} color="#89B4FA" />
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
  const { loading, error, data, refetch } = useQuery(GET_TEAMS);
  const [addTeam] = useMutation(ADD_TEAM);
  const [updateTeam] = useMutation(UPDATE_TEAM);
  const [deleteTeam] = useMutation(DELETE_TEAM);

  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState(null);
  const [formData, setFormData] = useState({
    team_name: "",
    team_color: "#89B4FA",
    team_logo: "",
    team_motto: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

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
  }, [data, sortOrder, searchQuery]);

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
        team_color: "#89B4FA",
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

  if (loading) return <LoadingIndicator visible={true} message="Loading..." />;

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

      <View style={globalstyles.loginButtonContainer}>
        <Link href={"/login"}>
          <MaterialIcons name="login" size={30} color="#fff" />
        </Link>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Team Management</Text>
        <Text style={styles.subtitle}>
          {filteredAndSortedTeams.length} team
          {filteredAndSortedTeams.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#A6ADC8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            placeholderTextColor="#A6ADC8"
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
              color="#CDD6F4"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={openAddTeamModal} style={styles.addButton}>
            <MaterialIcons
              name="group-add"
              size={18}
              color="#1E1E2E"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.addButtonText}>Add Team</Text>
          </TouchableOpacity>
        </View>
      </View>

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
              placeholderTextColor="#A6ADC8"
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
              placeholderTextColor="#A6ADC8"
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
              placeholderTextColor="#A6ADC8"
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
              placeholderTextColor="#A6ADC8"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1B26",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#CDD6F4",
  },
  subtitle: {
    fontSize: 14,
    color: "#A6ADC8",
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#24273A",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#313244",
    marginRight: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#CDD6F4",
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    padding: 8,
    backgroundColor: "#313244",
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#89B4FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#1E1E2E",
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#24273A",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#313244",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#313244",
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1B26",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E1E2E",
  },
  teamTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#CDD6F4",
  },
  teamId: {
    color: "#A6ADC8",
    fontSize: 12,
    marginTop: 2,
  },
  teamMotto: {
    color: "#A6ADC8",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    padding: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#313244",
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(243, 139, 168, 0.1)",
  },
  actionText: {
    color: "#89B4FA",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteText: {
    color: "#F38BA8",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  errorText: {
    color: "#F38BA8",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#A6ADC8",
    fontSize: 16,
    marginTop: 12,
  },
  modal: {
    backgroundColor: "#24273A",
    borderRadius: 12,
    width: width - 40,
    alignSelf: "center",
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    color: "#CDD6F4",
    fontSize: 18,
    fontWeight: "700",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#313244",
    marginBottom: 16,
  },
  formGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: "#CDD6F4",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#45475A",
    backgroundColor: "#1E1E2E",
    padding: 12,
    borderRadius: 8,
    color: "#CDD6F4",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#89B4FA",
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#1E1E2E",
    fontWeight: "700",
    fontSize: 16,
  },
});
