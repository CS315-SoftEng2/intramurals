// React and library imports
import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  ActivityIndicator,
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

// Queries
import GET_EVENTS from "../../../queries/eventsQuery";
import GET_CATEGORIES from "../../../queries/categoriesQuery";

// Mutations
import {
  ADD_EVENT,
  UPDATE_EVENT,
  DELETE_EVENT,
} from "../../../mutations/eventMutation";

const Event = () => {
  const {
    loading: eventLoading,
    error: eventError,
    data: eventData,
    refetch: refetchEvents,
  } = useQuery(GET_EVENTS);

  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(GET_CATEGORIES);

  const [addEvent] = useMutation(ADD_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Category options for StyledPicker
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return [
      { label: "Select Category", value: "", enabled: false },
      ...categoriesData.categories.map((category) => ({
        label: `${category.category_name} - ${category.division}`,
        value: category.category_id.toString(),
      })),
    ].sort((a, b) =>
      a.value === "" ? -1 : parseInt(a.value) - parseInt(b.value)
    );
  }, [categoriesData]);

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
      event_name: "",
      venue: "",
      category_id: "",
    });
    setEditMode(false);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((event) => {
    setFormData({
      event_name: event.event_name,
      venue: event.venue,
      category_id: event.category_id.toString(),
    });
    setEditMode(true);
    setEditId(event.event_id);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((event_id) => {
    setDeleteId(event_id);
    setAlertVisible(true);
  }, []);

  const confirmDelete = async () => {
    try {
      const response = await deleteEvent({
        variables: { adminId: 1, eventId: deleteId },
        update: (cache) => {
          cache.evict({ fieldName: "events" });
          cache.gc();
        },
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
    if (!formData.category_id) {
      Toast.show({
        type: "error",
        text1: "Missing Field!",
        text2: "Please select a category.",
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
      setSubmitting(true);
      let response;
      if (editMode) {
        response = await updateEvent({
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
        response = await addEvent({ variables: addVariables });
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
    } finally {
      setSubmitting(false);
    }
  };

  if (eventLoading || categoriesLoading) {
    return <LoadingIndicator visible={true} message="Loading..." />;
  }

  if (eventError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error loading events: {eventError.message}
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
        renderItem={({ item }) => {
          const category = item.category_id
            ? categoryMap.get(item.category_id.toString()) || {}
            : {};

          return (
            <View style={styles.matchCard}>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Event Name:</Text>{" "}
                {item.event_name}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Venue:</Text> {item.venue}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Category:</Text>{" "}
                {category.category_name || "N/A"}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.cardLabel}>Division:</Text>{" "}
                {category.division || "N/A"}
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
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>No matches available.</Text>
          </View>
        }
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
            <Text style={styles.formLabel}>Category</Text>
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
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (submitting ||
                categoriesLoading ||
                categoriesError ||
                categoryOptions.length <= 1) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              submitting ||
              categoriesLoading ||
              categoriesError ||
              categoryOptions.length <= 1
            }
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? "Update Event" : "Create Event"}
              </Text>
            )}
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

export default Event;
