// React and library imports
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

// Components
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/customAlert";

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
    <ScrollView style={styles.container}>
      {/* Logout button */}
      <View style={globalstyles.loginButtonContainer}>
        <TouchableOpacity onPress={() => handleLogout(logout)}>
          <MaterialIcons name="logout" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tables */}
      <MatchTable />
      <ScheduleTable />
      <EventTable />
      <CategoryTable />
    </ScrollView>
  );
};

const MatchTable = () => {
  const {
    loading: matchLoading,
    error: matchError,
    data: matchData,
    refetch: refetchMatches,
  } = useQuery(GET_MATCHES, {
    onError: (err) => console.error("GET_MATCHES error:", err),
  });

  const [addMatch] = useMutation(ADD_MATCH, {
    onError: (err) => console.error("ADD_MATCH error:", err),
  });
  const [updateMatch] = useMutation(UPDATE_MATCH, {
    onError: (err) => console.error("UPDATE_MATCH error:", err),
  });
  const [deleteMatch] = useMutation(DELETE_MATCH, {
    onError: (err) => console.error("DELETE_MATCH error:", err),
  });

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

  if (matchLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (matchError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error occurred!</Text>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      {/* Table header */}
      <View style={styles.tableAddButtonContainer}>
        <Text style={styles.tableTitle}>Match Table</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addMatchButton}>
          <MaterialIcons name="assignment-add" size={18} color="#89B4FA" />
          <Text style={styles.addButtonText}>Add Match</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.matchTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.smallCell]}>ID</Text>
            <Text style={[styles.headerCell, styles.smallCell]}>Sched</Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Team A</Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Team B</Text>
            <Text style={[styles.headerCell, styles.smallCell]}>User ID</Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Actions</Text>
          </View>
          {sortedMatches.map((match, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.match_id}
              </Text>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.schedule_id}
              </Text>
              <Text
                style={[styles.cell, styles.mediumCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.team_a_name}
              </Text>
              <Text
                style={[styles.cell, styles.mediumCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.team_b_name}
              </Text>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.user_assigned_id}
              </Text>
              <View style={[styles.cell, styles.mediumCell, styles.actionCell]}>
                <TouchableOpacity
                  onPress={() => handleEdit(match)}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={18} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(match.match_id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#F38BA8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
            <TextInput
              placeholder="Enter schedule id"
              value={formData.schedule_id}
              onChangeText={(text) =>
                setFormData({ ...formData, schedule_id: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Team A Name</Text>
            <TextInput
              placeholder="Enter team A name"
              value={formData.team_a_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_a_name: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Team B Name</Text>
            <TextInput
              placeholder="Enter team B name"
              value={formData.team_b_name}
              onChangeText={(text) =>
                setFormData({ ...formData, team_b_name: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>User Assigned ID</Text>
            <TextInput
              placeholder="Enter user assigned ID"
              value={formData.user_assigned_id}
              onChangeText={(text) =>
                setFormData({ ...formData, user_assigned_id: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
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

const ScheduleTable = () => {
  const {
    loading: scheduleLoading,
    error: scheduleError,
    data: scheduleData,
    refetch: refetchSchedules,
  } = useQuery(GET_SCHEDULES, {
    onError: (err) => console.error("GET_SCHEDULES error:", err),
  });

  const [addSchedule] = useMutation(ADD_SCHEDULE, {
    onError: (err) => console.error("ADD_SCHEDULE error:", err),
  });
  const [updateSchedule] = useMutation(UPDATE_SCHEDULE, {
    onError: (err) => console.error("UPDATE_SCHEDULE error:", err),
  });
  const [deleteSchedule] = useMutation(DELETE_SCHEDULE, {
    onError: (err) => console.error("DELETE_SCHEDULE error:", err),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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

  const handleSubmit = async () => {
    if (!formData.date.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Date cannot be empty.",
      });
      return;
    }
    if (!formData.start_time.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Start time cannot be empty.",
      });
      return;
    }
    if (!formData.end_time.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "End time cannot be empty.",
      });
      return;
    }
    if (!formData.event_id.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Event ID cannot be empty.",
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

    const eventId = parseInt(formData.event_id);
    const categoryId = parseInt(formData.category_id);
    if (isNaN(eventId)) {
      Toast.show({
        type: "error",
        text1: "Invalid Input!",
        text2: "Event ID must be a valid number.",
      });
      return;
    }
    if (isNaN(categoryId)) {
      Toast.show({
        type: "error",
        text1: "Invalid Input!",
        text2: "Category ID must be a valid number.",
      });
      return;
    }

    const formattedDate = formData.date;
    const formattedStartTime = formData.start_time;
    const formattedEndTime = formData.end_time;

    if (!formattedDate) {
      Toast.show({
        type: "error",
        text1: "Invalid Input!",
        text2: "Invalid date format. Use: Monday, April 21, 2025",
      });
      return;
    }
    if (!formattedStartTime || !formattedEndTime) {
      Toast.show({
        type: "error",
        text1: "Invalid Input!",
        text2: "Invalid time format. Use: 10:00 AM",
      });
      return;
    }

    const variables = {
      schedule: {
        date: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        event_id: eventId,
        category_id: categoryId,
      },
      adminId: 1,
      scheduleId: editMode ? parseInt(editId) : undefined,
    };

    try {
      if (editMode) {
        const response = await updateSchedule({
          variables,
          update: (cache) => {
            cache.evict({ fieldName: "schedules" });
            cache.gc();
          },
        });
        const { type, message } = response.data.updateSchedule;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      } else {
        const { scheduleId, ...addVariables } = variables;
        const response = await addSchedule({
          variables: addVariables,
          update: (cache) => {
            cache.evict({ fieldName: "schedules" });
            cache.gc();
          },
        });
        const { type, message } = response.data.addSchedule;
        Toast.show({
          type: type === "success" ? "success" : "error",
          text1: type.charAt(0).toUpperCase() + type.slice(1),
          text2: message,
        });
        if (type === "error") return;
      }
      await refetchSchedules();
      setModalVisible(false);
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        event_id: "",
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

  const handleEdit = (schedule) => {
    setFormData({
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      event_id: parseInt(schedule.event_id).toString(),
      category_id: parseInt(schedule.category_id).toString(),
    });
    setEditMode(true);
    setEditId(schedule.schedule_id);
    setModalVisible(true);
  };

  const handleDelete = (schedule_id) => {
    setDeleteId(schedule_id);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteSchedule({
        variables: { adminId: 1, scheduleId: deleteId },
      });
      const { type, message } = response.data.deleteSchedule;
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

  const openAddModal = () => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      event_id: "",
      category_id: "",
    });
    setEditMode(false);
    setModalVisible(true);
  };

  if (scheduleLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (scheduleError) {
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
        <Text style={styles.tableTitle}>Schedule Table</Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.addScheduleButton}
        >
          <MaterialIcons name="assignment-add" size={18} color="#89B4FA" />
          <Text style={styles.addButtonText}>Add Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.matchTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.smallCell]}>ID</Text>
            <Text style={[styles.headerCell, styles.smallCell]}>Category</Text>
            <Text style={[styles.headerCell, styles.smallCell]}>Event</Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>Time</Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>Date</Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Actions</Text>
          </View>
          {sortedSchedules.map((s, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {s.schedule_id}
              </Text>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {s.category_id}
              </Text>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {s.event_id}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {s.start_time} - {s.end_time}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {s.date}
              </Text>
              <View style={[styles.cell, styles.mediumCell, styles.actionCell]}>
                <TouchableOpacity
                  onPress={() => handleEdit(s)}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={18} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(s.schedule_id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#F38BA8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
              {editMode ? "Edit Schedule" : "Add New Schedule"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalDivider} />
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date</Text>
            <TextInput
              placeholder="Enter date (e.g., April 21, 2025)"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Start Time</Text>
            <TextInput
              placeholder="Enter start time (e.g., 10:00 AM)"
              value={formData.start_time}
              onChangeText={(text) =>
                setFormData({ ...formData, start_time: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>End Time</Text>
            <TextInput
              placeholder="Enter end time (e.g., 11:30 PM)"
              value={formData.end_time}
              onChangeText={(text) =>
                setFormData({ ...formData, end_time: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Event ID</Text>
            <TextInput
              placeholder="Enter event id"
              value={formData.event_id}
              onChangeText={(text) =>
                setFormData({ ...formData, event_id: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Category ID</Text>
            <TextInput
              placeholder="Enter category id"
              value={formData.category_id}
              onChangeText={(text) =>
                setFormData({ ...formData, category_id: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
              {editMode ? "Update Schedule" : "Create Schedule"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
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
  } = useQuery(GET_EVENTS, {
    onError: (err) => console.error("GET_EVENTS error:", err),
  });

  const [addEvent] = useMutation(ADD_EVENT, {
    onError: (err) => console.error("ADD_EVENT error:", err),
  });
  const [updateEvent] = useMutation(UPDATE_EVENT, {
    onError: (err) => console.error("UPDATE_EVENT error:", err),
  });
  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onError: (err) => console.error("DELETE_EVENT error:", err),
  });

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
          <MaterialIcons name="assignment-add" size={18} color="#89B4FA" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.matchTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.smallCell]}>ID</Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>
              Event Name
            </Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>
              Venue
            </Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Actions</Text>
          </View>
          {sortedEvents.map((e, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {e.event_id}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {e.event_name}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {e.venue}
              </Text>
              <View style={[styles.cell, styles.mediumCell, styles.actionCell]}>
                <TouchableOpacity
                  onPress={() => handleEdit(e)}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={18} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(e.event_id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#F38BA8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Venue</Text>
            <TextInput
              placeholder="Enter venue"
              value={formData.venue}
              onChangeText={(text) => setFormData({ ...formData, venue: text })}
              style={styles.input}
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Category ID</Text>
            <TextInput
              placeholder="Enter category id"
              value={formData.category_id}
              onChangeText={(text) =>
                setFormData({ ...formData, category_id: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
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
  } = useQuery(GET_CATEGORIES, {
    onError: (err) => console.error("GET_CATEGORIES error:", err),
  });

  const [addCategory] = useMutation(ADD_CATEGORY, {
    onError: (err) => console.error("ADD_CATEGORY error:", err),
  });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onError: (err) => console.error("UPDATE_CATEGORY error:", err),
  });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onError: (err) => console.error("DELETE_CATEGORY error:", err),
  });

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
          <MaterialIcons name="assignment-add" size={18} color="#89B4FA" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Table content */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.matchTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.smallCell]}>ID</Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>
              Category Name
            </Text>
            <Text style={[styles.headerCell, styles.extraLargeCell]}>
              Division
            </Text>
            <Text style={[styles.headerCell, styles.mediumCell]}>Actions</Text>
          </View>
          {sortedCategories.map((c, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text
                style={[styles.cell, styles.smallCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {c.category_id}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {c.category_name}
              </Text>
              <Text
                style={[styles.cell, styles.extraLargeCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {c.division}
              </Text>
              <View style={[styles.cell, styles.mediumCell, styles.actionCell]}>
                <TouchableOpacity
                  onPress={() => handleEdit(c)}
                  style={styles.editButton}
                >
                  <Ionicons name="create" size={18} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(c.category_id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={18} color="#F38BA8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Division</Text>
            <TextInput
              placeholder="Enter division"
              value={formData.division}
              onChangeText={(text) =>
                setFormData({ ...formData, division: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
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
