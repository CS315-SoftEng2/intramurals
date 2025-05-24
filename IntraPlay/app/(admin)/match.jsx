// React and library imports
import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { format, parse, isValid } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

// Components
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/customAlert";
import StyledPicker from "../components/styledPicker";

// Styles
import styles from "../../assets/styles/matchStyles";
import globalstyles from "../../assets/styles/globalstyles";

// Context and utilities
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

// Queries
import GET_MATCHES from "../../queries/matchesQuery";
import GET_CATEGORIES from "../../queries/categoriesQuery";
import GET_SCHEDULES from "../../queries/scheduleQuery";
import GET_EVENTS from "../../queries/eventsQuery";
import GET_USERS from "../../queries/userAccountQuery";

// Mutations
import {
  ADD_MATCH,
  UPDATE_MATCH,
  DELETE_MATCH,
} from "../../mutations/matchMutation";
import {
  ADD_SCHEDULE,
  UPDATE_SCHEDULE,
  DELETE_SCHEDULE,
} from "../../mutations/scheduleMutation";
import {
  ADD_EVENT,
  UPDATE_EVENT,
  DELETE_EVENT,
} from "../../mutations/eventMutation";
import {
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../../mutations/categoryMutation";

const Match = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={globalstyles.loginButtonContainer}>
        <TouchableOpacity onPress={() => handleLogout(logout)}>
          <MaterialIcons name="logout" size={25} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          { key: "match" },
          { key: "schedule" },
          { key: "event" },
          { key: "category" },
        ]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          switch (item.key) {
            case "match":
              return <MatchTable />;
            case "schedule":
              return <ScheduleTable />;
            case "event":
              return <EventTable />;
            case "category":
              return <CategoryTable />;
            default:
              return null;
          }
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const MatchTable = () => {
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
        label: `ID: ${schedule.schedule_id}, ${schedule.date}, ${
          schedule.start_time
        }-${schedule.end_time}, ${
          eventsMap.get(schedule.event_id) || "Unknown Event"
        }, ${categoriesMap.get(schedule.category_id) || "Unknown Category"}`,
        value: schedule.schedule_id.toString(),
      })),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [schedulesData, categoriesData, eventsData]);

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
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Match ID:</Text> {item.match_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Schedule ID:</Text>{" "}
              {item.schedule_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Team A:</Text> {item.team_a_name}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Team B:</Text> {item.team_b_name}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>User ID:</Text>{" "}
              {item.user_assigned_id}
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
        )}
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
            <Text style={styles.formLabel}>Schedule ID</Text>
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
                <Text style={{ color: "#F38BA8", fontSize: 14 }}>
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
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>Team B Name</Text>
            <TextInput
              placeholder="Enter team B name"
              value={formData.team_b_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_b_name: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>User Assigned ID</Text>
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
                        label: `(ID: ${user.user_id}) ${user.user_name}`,
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

const ScheduleTable = ({ adminId = 1 }) => {
  const {
    loading: scheduleLoading,
    error: scheduleError,
    data: scheduleData,
    refetch: refetchSchedules,
  } = useQuery(GET_SCHEDULES);

  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(GET_EVENTS);

  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(GET_CATEGORIES);

  const [addSchedule] = useMutation(ADD_SCHEDULE);
  const [updateSchedule] = useMutation(UPDATE_SCHEDULE);
  const [deleteSchedule] = useMutation(DELETE_SCHEDULE);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [dateObj, setDateObj] = useState(new Date());
  const [startTimeObj, setStartTimeObj] = useState(new Date());
  const [endTimeObj, setEndTimeObj] = useState(new Date());

  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    event_id: "",
    category_id: "",
  });

  const schedules = scheduleData?.schedules || [];
  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => a.schedule_id - b.schedule_id),
    [schedules]
  );

  // Parse date/time with fallback
  const parseDate = (dateStr, fallback = new Date()) => {
    try {
      const parsed = parse(dateStr, "EEEE, MMMM d, yyyy", new Date());
      return isValid(parsed) ? parsed : fallback;
    } catch (err) {
      return fallback;
    }
  };

  const parseTime = (timeStr, fallback = new Date()) => {
    try {
      const parsed = parse(timeStr, "hh:mm a", new Date());
      return isValid(parsed) ? parsed : fallback;
    } catch (err) {
      return fallback;
    }
  };

  // Event options for StyledPicker
  const eventOptions = useMemo(() => {
    if (!eventsData?.events) return [];
    return [
      { label: "Select Event", value: "", enabled: false },
      ...eventsData.events.map((event) => ({
        label: `ID: ${event.event_id}, ${event.event_name}, ${event.venue}`,
        value: event.event_id.toString(),
      })),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [eventsData]);

  // Category options for StyledPicker
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return [
      { label: "Select Category", value: "", enabled: false },
      ...categoriesData.categories.map((category) => ({
        label: `ID: ${category.category_id}, ${category.category_name} - ${category.division}`,
        value: category.category_id.toString(),
      })),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [categoriesData]);

  const openAddModal = useCallback(() => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      event_id: "",
      category_id: "",
    });
    setDateObj(new Date());
    setStartTimeObj(new Date());
    setEndTimeObj(new Date());
    setEditMode(false);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((schedule) => {
    const parsedDate = parseDate(schedule.date);
    const parsedStartTime = parseTime(schedule.start_time, parsedDate);
    const parsedEndTime = parseTime(schedule.end_time, parsedDate);

    setFormData({
      date: schedule.date || "",
      start_time: schedule.start_time || "",
      end_time: schedule.end_time || "",
      event_id: String(schedule.event_id || ""),
      category_id: String(schedule.category_id || ""),
    });
    setDateObj(parsedDate);
    setStartTimeObj(parsedStartTime);
    setEndTimeObj(parsedEndTime);
    setEditMode(true);
    setEditId(schedule.schedule_id);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((schedule_id) => {
    setDeleteId(schedule_id);
    setAlertVisible(true);
  }, []);

  const confirmDelete = async () => {
    try {
      const { data } = await deleteSchedule({
        variables: { adminId, scheduleId: deleteId },
        update: (cache) => {
          cache.evict({ fieldName: "schedules" });
          cache.gc();
        },
      });

      const { type, message } = data.deleteSchedule;
      Toast.show({
        type: type === "success" ? "success" : "error",
        text1: type.charAt(0).toUpperCase() + type.slice(1),
        text2: message,
      });

      if (type === "error") return;
      await refetchSchedules();
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

  const handleSubmit = async () => {
    if (
      !formData.date ||
      !formData.start_time ||
      !formData.end_time ||
      !formData.event_id ||
      !formData.category_id
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields!",
        text2: "All fields are required.",
      });
      return;
    }

    const eventId = parseInt(formData.event_id);
    const categoryId = parseInt(formData.category_id);
    if (isNaN(eventId) || isNaN(categoryId)) {
      Toast.show({
        type: "error",
        text1: "Invalid IDs",
        text2: "Event and Category ID must be numbers.",
      });
      return;
    }

    // Validate time: end_time should be after start_time
    const start = parseTime(formData.start_time);
    const end = parseTime(formData.end_time);
    if (end <= start) {
      Toast.show({
        type: "error",
        text1: "Invalid Time",
        text2: "End time must be after start time.",
      });
      return;
    }

    const variables = {
      schedule: {
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        event_id: eventId,
        category_id: categoryId,
      },
      adminId,
      scheduleId: editMode ? parseInt(editId) : undefined,
    };

    try {
      setSubmitting(true);
      let data;
      if (editMode) {
        ({ data } = await updateSchedule({ variables }));
      } else {
        const { scheduleId, ...addVariables } = variables;
        ({ data } = await addSchedule({ variables: addVariables }));
      }

      const { type, message } = editMode
        ? data.updateSchedule
        : data.addSchedule;
      Toast.show({
        type: type === "success" ? "success" : "error",
        text1: type.charAt(0).toUpperCase() + type.slice(1),
        text2: message,
      });

      if (type === "error") return;
      await refetchSchedules();
      setModalVisible(false);
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        event_id: "",
        category_id: "",
      });
      setDateObj(new Date());
      setStartTimeObj(new Date());
      setEndTimeObj(new Date());
      setEditMode(false);
      setEditId(null);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (scheduleLoading || eventsLoading || categoriesLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (scheduleError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading schedules: {scheduleError.message}
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

  if (categoriesError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading categories: {categoriesError.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.otherContentContainer}>
      {/* Header */}
      <View style={styles.tableAddButtonContainer}>
        <Text style={styles.tableTitle}>Schedule Table</Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.addScheduleButton}
        >
          <MaterialIcons name="assignment-add" size={18} color="#1E88E5" />
          <Text style={styles.addButtonText}>Add Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <FlatList
        data={sortedSchedules}
        keyExtractor={(item) => item.schedule_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Schedule ID:</Text>{" "}
              {item.schedule_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Category ID:</Text>{" "}
              {item.category_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Event ID:</Text> {item.event_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Date:</Text> {item.date}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Time:</Text> {item.start_time} -{" "}
              {item.end_time}
            </Text>

            <View style={styles.actionCell}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Ionicons name="create" size={18} color="#22C55E" />
                <Text style={styles.editButtonText}>Update Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.schedule_id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={18} color="#F38BA8" />
                <Text style={styles.deleteButtonText}>Delete Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No schedules available.</Text>}
      />

      {/* Modal */}
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
              {editMode ? "Edit Schedule" : "Add New Schedule"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />

          {/* Form */}
          <View style={styles.formGroup}>
            {/* Date Picker */}
            <Text style={styles.formLabel}>Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: formData.date ? "#fff" : "#A6ADC8" }}>
                {formData.date || "Select Date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selectedDate && isValid(selectedDate)) {
                    setDateObj(selectedDate);
                    setFormData({
                      ...formData,
                      date: format(selectedDate, "EEEE, MMMM d, yyyy"),
                    });
                  }
                }}
              />
            )}
            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Start Time Picker */}
            <Text style={styles.formLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: formData.start_time ? "#fff" : "#A6ADC8" }}>
                {formData.start_time || "Select Start Time"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTimeObj}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedTime) => {
                  if (Platform.OS === "android") setShowStartPicker(false);
                  if (selectedTime && isValid(selectedTime)) {
                    setStartTimeObj(selectedTime);
                    setFormData({
                      ...formData,
                      start_time: format(selectedTime, "hh:mm a"),
                    });
                  }
                }}
              />
            )}
            {Platform.OS === "ios" && showStartPicker && (
              <TouchableOpacity
                onPress={() => setShowStartPicker(false)}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* End Time Picker */}
            <Text style={styles.formLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: formData.end_time ? "#fff" : "#A6ADC8" }}>
                {formData.end_time || "Select End Time"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTimeObj}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedTime) => {
                  if (Platform.OS === "android") setShowEndPicker(false);
                  if (selectedTime && isValid(selectedTime)) {
                    setEndTimeObj(selectedTime);
                    setFormData({
                      ...formData,
                      end_time: format(selectedTime, "hh:mm a"),
                    });
                  }
                }}
              />
            )}
            {Platform.OS === "ios" && showEndPicker && (
              <TouchableOpacity
                onPress={() => setShowEndPicker(false)}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Event ID Picker */}
            <Text style={styles.formLabel}>Event ID</Text>
            <StyledPicker
              selectedValue={formData.event_id}
              onValueChange={(value) =>
                setFormData({ ...formData, event_id: value })
              }
              items={eventOptions}
              placeholder="Select Event"
              disabled={
                eventsLoading || eventsError || eventOptions.length <= 1
              }
            />
            {eventsLoading && <ActivityIndicator color="#A6ADC8" />}
            {eventsError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load events
              </Text>
            )}
            {!eventsLoading && !eventsError && eventOptions.length <= 1 && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                No events available
              </Text>
            )}

            {/* Category ID Picker */}
            <Text style={styles.formLabel}>Category ID</Text>
            <StyledPicker
              selectedValue={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
              items={categoryOptions}
              placeholder="Select Category"
              disabled={
                categoriesLoading ||
                categoriesError ||
                categoryOptions.length <= 1
              }
            />
            {categoriesLoading && <ActivityIndicator color="#A6ADC8" />}
            {categoriesError && (
              <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                Failed to load categories
              </Text>
            )}
            {!categoriesLoading &&
              !categoriesError &&
              categoryOptions.length <= 1 && (
                <Text style={{ color: "#F38BA8", fontSize: 14 }}>
                  No categories available
                </Text>
              )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (submitting ||
                eventsLoading ||
                eventsError ||
                eventOptions.length <= 1 ||
                categoriesLoading ||
                categoriesError ||
                categoryOptions.length <= 1) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              submitting ||
              eventsLoading ||
              eventsError ||
              eventOptions.length <= 1 ||
              categoriesLoading ||
              categoriesError ||
              categoryOptions.length <= 1
            }
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? "Update Schedule" : "Create Schedule"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule?"
      />
    </View>
  );
};

const EventTable = () => {
  const {
    loading: eventLoading,
    error: eventError,
    data: eventData,
    refetch: refetchEvents,
  } = useQuery(GET_EVENTS);

  const [addEvent] = useMutation(ADD_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    event_name: "",
    venue: "",
    category_id: "",
  });

  const events = eventData?.events || [];
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.event_id - b.event_id),
    [events]
  );

  const handleSubmit = async () => {
    if (!formData.event_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Event name cannot be empty.",
      });
      return;
    }
    if (!formData.venue.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Venue cannot be empty.",
      });
      return;
    }
    if (!formData.category_id.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Category ID cannot be empty.",
      });
      return;
    }

    const categoryId = parseInt(formData.category_id);
    if (isNaN(categoryId)) {
      Toast.show({
        type: "error",
        text1: "Invalid Input!",
        text2: "Category ID must be a valid number.",
      });
      return;
    }

    const variables = {
      event: {
        event_name: formData.event_name,
        venue: formData.venue,
        category_id: categoryId,
      },
      adminId: 1,
      eventId: editMode ? parseInt(editId) : undefined,
    };

    try {
      if (editMode) {
        const response = await updateEvent({
          variables,
          update: (cache) => {
            cache.evict({ fieldName: "events" });
            cache.gc();
          },
        });
        const { type, message } = response.data.updateEvent;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      } else {
        const { eventId, ...addVariables } = variables;
        const response = await addEvent({ variables: addVariables });
        const { type, message } = response.data.addEvent;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      }
      await refetchEvents();
      setModalVisible(false);
      setFormData({
        event_name: "",
        venue: "",
        category_id: "",
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

  const handleEdit = (event) => {
    setFormData({
      event_name: event.event_name,
      venue: event.venue,
      category_id: parseInt(event.category_id).toString(),
    });
    setEditMode(true);
    setEditId(event.event_id);
    setModalVisible(true);
  };

  const handleDelete = (event_id) => {
    setDeleteId(event_id);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteEvent({
        variables: { adminId: 1, eventId: deleteId },
      });
      const { type, message } = response.data.deleteEvent;
      Toast.show({
        type: type === "success" ? "success" : "error",
        text1: type.charAt(0).toUpperCase() + type.slice(1),
        text2: message,
      });
      if (type === "error") return;
      await refetchEvents();
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
      event_name: "",
      venue: "",
      category_id: "",
    });
    setEditMode(false);
    setModalVisible(true);
  };

  if (eventLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (eventError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error occurred!</Text>
      </View>
    );
  }

  return (
    <View style={styles.otherContentContainer}>
      {/* Table header */}
      <View style={styles.tableAddButtonContainer}>
        <Text style={styles.tableTitle}>Event Table</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addEventButton}>
          <MaterialIcons name="assignment-add" size={18} color="#1E88E5" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.event_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Event ID:</Text> {item.event_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Name:</Text> {item.event_name}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Venue:</Text> {item.venue}
            </Text>

            <View style={styles.actionCell}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Ionicons name="create" size={18} color="#22C55E" />
                <Text style={styles.editButtonText}>Update Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.event_id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={18} color="#F38BA8" />
                <Text style={styles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No events available.</Text>}
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
              {editMode ? "Edit Event" : "Add New Event"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Event Name</Text>
            <TextInput
              placeholder="Enter event name"
              value={formData.event_name}
              onChangeText={(text) =>
                setFormData({ ...formData, event_name: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>Venue</Text>
            <TextInput
              placeholder="Enter venue"
              value={formData.venue}
              onChangeText={(text) => setFormData({ ...formData, venue: text })}
              style={styles.input}
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>Category ID</Text>
            <TextInput
              placeholder="Enter category id"
              value={formData.category_id}
              onChangeText={(text) =>
                setFormData({ ...formData, category_id: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Event" : "Create Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
      />
    </View>
  );
};

const CategoryTable = () => {
  const {
    loading: categoryLoading,
    error: categoryError,
    data: categoryData,
    refetch: refetchCategories,
  } = useQuery(GET_CATEGORIES);

  const [addCategory] = useMutation(ADD_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    division: "",
  });

  const categories = categoryData?.categories || [];
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.category_id - b.category_id),
    [categories]
  );

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Category name cannot be empty.",
      });
      return;
    }
    if (!formData.division.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Division cannot be empty.",
      });
      return;
    }

    const variables = {
      category: {
        category_name: formData.category_name,
        division: formData.division,
      },
      adminId: 1,
      categoryId: editMode ? parseInt(editId) : undefined,
    };

    try {
      if (editMode) {
        const response = await updateCategory({
          variables,
          update: (cache) => {
            cache.evict({ fieldName: "categories" });
            cache.gc();
          },
        });
        const { type, message } = response.data.updateCategory;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      } else {
        const { categoryId, ...addVariables } = variables;
        const response = await addCategory({ variables: addVariables });
        const { type, message } = response.data.addCategory;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      }
      await refetchCategories();
      setModalVisible(false);
      setFormData({
        category_name: "",
        division: "",
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

  const handleEdit = (category) => {
    setFormData({
      category_name: category.category_name,
      division: category.division,
    });
    setEditMode(true);
    setEditId(category.category_id);
    setModalVisible(true);
  };

  const handleDelete = (category_id) => {
    setDeleteId(category_id);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteCategory({
        variables: { adminId: 1, categoryId: deleteId },
      });
      const { type, message } = response.data.deleteCategory;
      Toast.show({
        type: type === "success" ? "success" : "error",
        text1: type.charAt(0).toUpperCase() + type.slice(1),
        text2: message,
      });
      if (type === "error") return;
      await refetchCategories();
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
      category_name: "",
      division: "",
    });
    setEditMode(false);
    setModalVisible(true);
  };

  if (categoryLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (categoryError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error occurred!</Text>
      </View>
    );
  }

  return (
    <View style={styles.otherContentContainer}>
      {/* Table header */}
      <View style={styles.tableAddButtonContainer}>
        <Text style={styles.tableTitle}>Category Table</Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.addCategoryButton}
        >
          <MaterialIcons name="assignment-add" size={18} color="#1E88E5" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <FlatList
        data={sortedCategories}
        keyExtractor={(item) => item.category_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Category ID:</Text>{" "}
              {item.category_id}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Name:</Text> {item.category_name}
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.cardLabel}>Division:</Text> {item.division}
            </Text>

            <View style={styles.actionCell}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}
              >
                <Ionicons name="create" size={18} color="#22C55E" />
                <Text style={styles.editButtonText}>Update Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.category_id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={18} color="#F38BA8" />
                <Text style={styles.deleteButtonText}>Delete Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No categories available.</Text>}
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
              {editMode ? "Edit Category" : "Add New Category"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category Name</Text>
            <TextInput
              placeholder="Enter category name"
              value={formData.category_name}
              onChangeText={(text) =>
                setFormData({ ...formData, category_name: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>Division</Text>
            <TextInput
              placeholder="Enter division"
              value={formData.division}
              onChangeText={(text) =>
                setFormData({ ...formData, division: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Category" : "Create Category"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
      />
    </View>
  );
};

export default Match;
