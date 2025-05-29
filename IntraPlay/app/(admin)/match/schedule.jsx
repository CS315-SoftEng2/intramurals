// React and library imports
import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
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
import LoadingIndicator from "../../components/LoadingIndicator";
import CustomAlert from "../../components/customAlert";
import StyledPicker from "../../components/styledPicker";

// Styles
import styles from "../../../assets/styles/matchStyles";

// Queries
import GET_CATEGORIES from "../../../queries/categoriesQuery";
import GET_SCHEDULES from "../../../queries/scheduleQuery";
import GET_EVENTS from "../../../queries/eventsQuery";

// Mutations
import {
  ADD_SCHEDULE,
  UPDATE_SCHEDULE,
  DELETE_SCHEDULE,
} from "../../../mutations/scheduleMutation";

const Schedule = ({ adminId = 1 }) => {
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
    if (!eventsData?.events || !categoriesData?.categories)
      return [{ label: "Select Event", value: "", enabled: false }];

    return [
      { label: "Select Event", value: "", enabled: false },
      ...eventsData.events.map((event) => {
        const category = categoriesData.categories.find(
          (cat) => cat.category_id === event.category_id
        );
        const categoryName = category?.category_name || "Unknown Category";
        const divisionName = category?.division || "Unknown Division";

        return {
          label: `${event.event_name}, ${event.venue}, ${categoryName}, ${divisionName}`,
          value: event.event_id.toString(),
        };
      }),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [eventsData, categoriesData]);

  const scheduleMap = useMemo(() => {
    return new Map(
      scheduleData?.schedules?.map((schedule) => [
        schedule.schedule_id.toString(),
        {
          date: schedule.date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          event_id: schedule.event_id,
        },
      ]) || []
    );
  }, [scheduleData]);

  const eventMap = useMemo(() => {
    return new Map(
      eventsData?.events?.map((event) => [
        event.event_id.toString(),
        {
          event_name: event.event_name,
          venue: event.venue,
          category_id: event.category_id?.toString() || null,
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

  const openAddModal = useCallback(() => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      event_id: "",
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
      !formData.event_id
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields!",
        text2: "All fields are required.",
      });
      return;
    }

    const eventId = parseInt(formData.event_id);
    if (isNaN(eventId)) {
      Toast.show({
        type: "error",
        text1: "Invalid IDs",
        text2: "Event ID must be numbers.",
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
        renderItem={({ item }) => {
          const schedule = scheduleMap.get(item.schedule_id.toString()) || {};
          const event = schedule.event_id
            ? eventMap.get(schedule.event_id.toString()) || {}
            : {};
          const category = event.category_id
            ? categoryMap.get(event.category_id.toString()) || {}
            : {};

          return (
            <View style={styles.matchCard}>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Event Name:</Text>{" "}
                {event.event_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Category:</Text>{" "}
                {category.category_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Division:</Text>{" "}
                {category.division}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Date:</Text> {item.date}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Time:</Text> {item.start_time} -{" "}
                {item.end_time}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Venue:</Text> {event.venue}
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
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>No matches available.</Text>
          </View>
        }
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
              <Text style={{ color: formData.date ? "#fff" : "#aaa" }}>
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
              <Text style={{ color: formData.start_time ? "#fff" : "#aaa" }}>
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
              <Text style={{ color: formData.end_time ? "#fff" : "#aaa" }}>
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
                categoriesError) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              submitting ||
              eventsLoading ||
              eventsError ||
              eventOptions.length <= 1 ||
              categoriesLoading ||
              categoriesError
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

export default Schedule;
