// React and library imports
import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

// Components
import LoadingIndicator from "../../components/LoadingIndicator";
import CustomAlert from "../../components/customAlert";
import StyledPicker from "../../components/styledPicker";

// Styles
import styles from "../../../assets/styles/matchStyles";
import globalstyles from "../../../assets/styles/globalstyles";

// Queries
import GET_MATCHES from "../../../queries/matchesQuery";
import GET_CATEGORIES from "../../../queries/categoriesQuery";
import GET_SCHEDULES from "../../../queries/scheduleQuery";
import GET_EVENTS from "../../../queries/eventsQuery";
import GET_USERS from "../../../queries/userAccountQuery";

// Mutations
import {
  ADD_MATCH,
  UPDATE_MATCH,
  DELETE_MATCH,
} from "../../../mutations/matchMutation";

const Match = () => {
  const {
    loading: matchLoading,
    error: matchError,
    data: matchData,
    refetch: refetchMatches,
  } = useQuery(GET_MATCHES);

  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
  } = useQuery(GET_USERS);

  const {
    loading: schedulesLoading,
    error: schedulesError,
    data: schedulesData,
  } = useQuery(GET_SCHEDULES);

  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(GET_CATEGORIES);

  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(GET_EVENTS);

  const [addMatch] = useMutation(ADD_MATCH);
  const [updateMatch] = useMutation(UPDATE_MATCH);
  const [deleteMatch] = useMutation(DELETE_MATCH);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    schedule_id: "",
    team_a_name: "",
    team_b_name: "",
    user_assigned_id: "",
  });

  // Filter out Admin users and memoize the result
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users
      .filter((user) => user.user_type !== "Admin")
      .sort((a, b) => a.user_id - b.user_id);
  }, [usersData]);

  // Combine schedules with event and category data
  const scheduleOptions = useMemo(() => {
    if (
      !schedulesData?.schedules ||
      !categoriesData?.categories ||
      !eventsData?.events
    )
      return [];

    const categoriesMap = new Map(
      categoriesData.categories.map((cat) => [
        cat.category_id,
        `${cat.category_name} - ${cat.division}`,
      ])
    );
    const eventsMap = new Map(
      eventsData.events.map((event) => [event.event_id, event.event_name])
    );
    return [
      { label: "Select Schedule", value: "", enabled: false },
      ...schedulesData.schedules.map((schedule) => ({
        label: `${schedule.date}, ${schedule.start_time} - ${
          schedule.end_time
        }, ${eventsMap.get(schedule.event_id) || "Unknown Event"}, ${
          categoriesMap.get(schedule.category_id) || "Unknown Category"
        }`,
        value: schedule.schedule_id.toString(),
      })),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [schedulesData, categoriesData, eventsData]);

  const scheduleMap = useMemo(() => {
    return new Map(
      schedulesData?.schedules?.map((schedule) => [
        schedule.schedule_id.toString(),
        {
          date: schedule.date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          event_id: schedule.event_id,
          category_id: schedule.category_id,
        },
      ]) || []
    );
  }, [schedulesData]);

  const eventMap = useMemo(() => {
    return new Map(
      eventsData?.events?.map((event) => [
        event.event_id.toString(),
        {
          event_name: event.event_name,
          venue: event.venue,
        },
      ]) || []
    );
  }, [eventsData]);

  const categoryMap = useMemo(() => {
    return new Map(
      categoriesData?.categories?.map((category) => [
        category.category_id.toString(),
        {
          category_name: category.category_name,
          division: category.division,
        },
      ]) || []
    );
  }, [categoriesData]);

  const userMap = useMemo(() => {
    return new Map(
      usersData?.users?.map((user) => [
        user.user_id.toString(),
        user.user_name,
      ]) || []
    );
  }, [usersData]);

  const matches = matchData?.getMatches || [];
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => a.match_id - b.match_id),
    [matches]
  );

  const handleSubmit = async () => {
    if (!formData.schedule_id.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Schedule ID cannot be empty.",
      });
      return;
    }
    if (!formData.team_a_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Team A name cannot be empty.",
      });
      return;
    }
    if (!formData.team_b_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Team B name cannot be empty.",
      });
      return;
    }
    if (!formData.user_assigned_id.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "User assigned ID cannot be empty.",
      });
      return;
    }

    const scheduleId = parseInt(formData.schedule_id);
    const userAssignedId = parseInt(formData.user_assigned_id);
    if (isNaN(scheduleId)) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "Schedule ID must be a valid number.",
      });
      return;
    }
    if (isNaN(userAssignedId)) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "User Assigned ID must be a valid number.",
      });
      return;
    }

    const variables = {
      match: {
        schedule_id: scheduleId,
        team_a_name: formData.team_a_name,
        team_b_name: formData.team_b_name,
        user_assigned_id: userAssignedId,
      },
      adminId: 1,
      matchId: editMode ? parseInt(editId) : undefined,
    };

    try {
      if (editMode) {
        const response = await updateMatch({
          variables,
          update: (cache) => {
            cache.evict({ fieldName: "getMatches" });
            cache.gc();
          },
        });
        const { type, message } = response.data.updateMatch;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      } else {
        const { matchId, ...addVariables } = variables;
        const response = await addMatch({ variables: addVariables });
        const { type, message } = response.data.addMatch;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      }
      await refetchMatches();
      setModalVisible(false);
      setFormData({
        schedule_id: "",
        team_a_name: "",
        team_b_name: "",
        user_assigned_id: "",
      });
      setEditMode(false);
      setEditId(null);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    }
  };

  const handleEdit = (match) => {
    if (!match.team_a_name || !match.team_b_name) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: "Unable to load team names. Please try again.",
      });
      return;
    }

    setFormData({
      schedule_id: parseInt(match.schedule_id).toString(),
      team_a_name: match.team_a_name,
      team_b_name: match.team_b_name,
      user_assigned_id: parseInt(match.user_assigned_id).toString(),
    });
    setEditMode(true);
    setEditId(match.match_id);
    setModalVisible(true);
  };

  const handleDelete = (match_id) => {
    setDeleteId(match_id);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteMatch({
        variables: { adminId: 1, match_id: deleteId },
      });
      const { type, message } = response.data.deleteMatch;
      Toast.show({
        type: type === "success" ? "success" : "error",
        text1: type.charAt(0).toUpperCase() + type.slice(1),
        text2: message,
      });
      if (type === "error") return;
      await refetchMatches();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    } finally {
      setAlertVisible(false);
      setDeleteId(null);
    }
  };

  const openAddModal = () => {
    setFormData({
      schedule_id: "",
      team_a_name: "",
      team_b_name: "",
      user_assigned_id: "",
    });
    setEditMode(false);
    setModalVisible(true);
  };

  if (
    matchLoading ||
    usersLoading ||
    schedulesLoading ||
    categoriesLoading ||
    eventsLoading
  ) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (matchError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error occurred: {matchError.message}
        </Text>
      </View>
    );
  }

  if (usersError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading users: {usersError.message}
        </Text>
      </View>
    );
  }

  if (schedulesError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading schedules: {schedulesError.message}
        </Text>
      </View>
    );
  }

  if (categoriesError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading categories: {categoriesError.message}
        </Text>
      </View>
    );
  }

  if (eventsError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading events: {eventsError.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      {/* Table header */}
      <View style={styles.tableAddButtonContainer}>
        <Text style={styles.tableTitle}>Match Table</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addMatchButton}>
          <MaterialIcons name="assignment-add" size={18} color="#1E88E5" />
          <Text style={styles.addButtonText}>Add Match</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <FlatList
        data={sortedMatches}
        keyExtractor={(item) => item.match_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          // Get schedule details
          const schedule = scheduleMap.get(item.schedule_id.toString()) || {};
          // Get event and category details from schedule
          const event = schedule.event_id
            ? eventMap.get(schedule.event_id.toString()) || {}
            : {};
          const category = schedule.category_id
            ? categoryMap.get(schedule.category_id.toString()) || {}
            : {};
          // Get user details
          const userName =
            userMap.get(item.user_assigned_id.toString()) ||
            "TBA Assigned User";

          return (
            <View style={styles.matchCard}>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Matchup Teams:</Text>{" "}
                {item.team_a_name} vs {item.team_b_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Date:</Text> {schedule.date}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Time:</Text>{" "}
                {schedule.start_time} - {schedule.end_time}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Venue:</Text> {event.venue}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Event Name:</Text>{" "}
                {event.event_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Category:</Text>{" "}
                {category.category_name || "Unknown Category"}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Division:</Text>{" "}
                {category.division || "Unknown Division"}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>User assigned:</Text> {userName}
              </Text>
              <View style={styles.actionCell}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={18} color="#22C55E" />
                  <Text style={styles.editButtonText}>Update Match</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.match_id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#F38BA8" />
                  <Text style={styles.deleteButtonText}>Delete Match</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text>No matches available.</Text>}
      />

      {/* Add/Edit modal */}
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
              {editMode ? "Edit Match" : "Add New Match"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Schedule</Text>
            <StyledPicker
              selectedValue={formData.schedule_id}
              onValueChange={(value) =>
                setFormData({ ...formData, schedule_id: value })
              }
              items={scheduleOptions}
              placeholder="Select Schedule"
              disabled={
                schedulesLoading ||
                schedulesError ||
                categoriesLoading ||
                categoriesError ||
                eventsLoading ||
                eventsError ||
                scheduleOptions.length <= 1
              }
            />
            {schedulesLoading || categoriesLoading || eventsLoading ? (
              <ActivityIndicator color="#A6ADC8" />
            ) : null}
            {schedulesError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load schedules
              </Text>
            )}
            {categoriesError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load categories
              </Text>
            )}
            {eventsError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load events
              </Text>
            )}
            {!schedulesLoading &&
              !schedulesError &&
              !categoriesLoading &&
              !categoriesError &&
              !eventsLoading &&
              !eventsError &&
              scheduleOptions.length <= 1 && (
                <Text style={{ color: "#fff", fontSize: 14 }}>
                  No schedules available
                </Text>
              )}
            <Text style={styles.formLabel}>Team A Name</Text>
            <TextInput
              placeholder="Enter team A name"
              value={formData.team_a_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_a_name: text })
              }
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.formLabel}>Team B Name</Text>
            <TextInput
              placeholder="Enter team B name"
              value={formData.team_b_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_b_name: text })
              }
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.formLabel}>User Assigned</Text>
            <StyledPicker
              selectedValue={formData.user_assigned_id}
              onValueChange={(value) =>
                setFormData({ ...formData, user_assigned_id: value })
              }
              items={
                usersLoading || usersError || filteredUsers.length === 0
                  ? []
                  : [
                      { label: "Select User", value: "", enabled: false },
                      ...filteredUsers.map((user) => ({
                        label: `${user.user_name}`,
                        value: user.user_id.toString(),
                      })),
                    ]
              }
              placeholder="Select User"
              disabled={
                usersLoading || usersError || filteredUsers.length === 0
              }
            />
            {usersLoading && <ActivityIndicator color="#A6ADC8" />}
            {usersError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load users
              </Text>
            )}
            {!usersLoading && !usersError && filteredUsers.length === 0 && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                No users available
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (usersLoading ||
                usersError ||
                filteredUsers.length === 0 ||
                schedulesLoading ||
                schedulesError ||
                categoriesLoading ||
                categoriesError ||
                eventsLoading ||
                eventsError ||
                scheduleOptions.length <= 1) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              usersLoading ||
              usersError ||
              filteredUsers.length === 0 ||
              schedulesLoading ||
              schedulesError ||
              categoriesLoading ||
              categoriesError ||
              eventsLoading ||
              eventsError ||
              scheduleOptions.length <= 1
            }
          >
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Match" : "Create Match"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Match"
        message="Are you sure you want to delete this match?"
      />
    </View>
  );
};

export default Match;
