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
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

// Components
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/customAlert";

// Styles
import styles from "../../assets/styles/userAccountStyles";

// Queries and mutations
import GET_USERS from "../../queries/userAccountQuery";
import {
  ADD_USER,
  UPDATE_USER,
  DELETE_USER,
} from "../../mutations/userAccountMutation";

// Context and utilities
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utils/handleLogout";

// UserItem component
const UserItem = ({ item, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.user_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userTextInfo}>
          <Text style={styles.username}>{item.user_name}</Text>
        </View>
      </View>
      <View
        style={[
          styles.tagContainer,
          item.user_type === "admin" ? styles.adminTag : styles.userTag,
        ]}
      >
        <Text
          style={[
            styles.tag,
            item.user_type === "admin" ? styles.tag : styles.userTagText,
          ]}
        >
          {item.user_type.toUpperCase()}
        </Text>
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
        onPress={() => onDelete(item.user_id)}
      >
        <MaterialIcons name="delete" size={16} color="#F38BA8" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Users = () => {
  // Queries and mutations
  const { loading, error, data, refetch } = useQuery(GET_USERS);
  const [addUser] = useMutation(ADD_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    user_type: "user",
  });
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    if (!data || !data.users) return [];

    let filteredUsers = data.users.filter(Boolean);

    if (searchQuery) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.user_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.user_id.toString().includes(searchQuery)
      );
    }

    return [...filteredUsers].sort((a, b) =>
      sortOrder === "asc" ? a.user_id - b.user_id : b.user_id - a.user_id
    );
  }, [data, searchQuery, sortOrder]);

  // Handlers
  const handleSubmit = async () => {
    if (!formData.user_name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "User name cannot be empty.",
      });
      return;
    }

    if (!["admin", "user"].includes(formData.user_type.toLowerCase())) {
      Toast.show({
        type: "error",
        text1: "Invalid user type.",
        text2: "User type must be 'admin' or 'user'.",
      });
      return;
    }

    if (!editMode && !formData.password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing field",
        text2: "Password cannot be empty.",
      });
      return;
    }

    const variables = {
      useraccount: {
        user_name: formData.user_name,
        password: formData.password,
        user_type: formData.user_type.toLowerCase(),
      },
      adminId: 1,
    };

    try {
      if (editMode) {
        const { data: updateData } = await updateUser({
          variables: { ...variables, userId: editUserId },
        });
        Toast.show({
          type: updateData.updateUserAccount.type.toLowerCase(),
          text1: updateData.updateUserAccount.message,
        });
      } else {
        const { data: addData } = await addUser({ variables });
        Toast.show({
          type: addData.addUserAccount.type.toLowerCase(),
          text1: addData.addUserAccount.message,
        });
      }
      refetch();
      setModalVisible(false);
      setFormData({ user_name: "", user_type: "user", password: "" });
      setEditMode(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error!",
        text2: err.message,
      });
    }
  };

  const handleDelete = (userId) => {
    setDeleteUserId(userId);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const { data: deleteData } = await deleteUser({
        variables: { adminId: 1, userId: deleteUserId },
      });
      Toast.show({
        type: deleteData.deleteUserAccount.type.toLowerCase(),
        text1: deleteData.deleteUserAccount.message,
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
      setDeleteUserId(null);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      user_name: user.user_name,
      user_type: user.user_type,
      password: "",
    });
    setEditMode(true);
    setEditUserId(user.user_id);
    setModalVisible(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const openAddUserModal = () => {
    setFormData({ user_name: "", user_type: "user", password: "" });
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

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.subtitle}>
          {filteredAndSortedUsers.length} user
          {filteredAndSortedUsers.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Search and actions */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#aaa" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#aaa"
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

          <TouchableOpacity onPress={openAddUserModal} style={styles.addButton}>
            <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User list */}
      {filteredAndSortedUsers.length > 0 ? (
        <FlatList
          data={filteredAndSortedUsers}
          renderItem={({ item }) => (
            <UserItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="people-outline" size={60} color="#45475A" />
          <Text style={styles.noDataText}>
            {searchQuery ? "No users match your search" : "No users found"}
          </Text>
        </View>
      )}

      {/* Add/Edit user modal */}
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
              {editMode ? "Edit User" : "Add New User"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#A6ADC8" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalDivider} />

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Username</Text>
            <TextInput
              placeholder="Enter username"
              value={formData.user_name}
              onChangeText={(text) =>
                setFormData({ ...formData, user_name: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
            />
            <Text style={styles.formLabel}>Password</Text>
            <TextInput
              placeholder="Enter Password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              style={styles.input}
              placeholderTextColor="grey"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>User Type</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.user_type === "user" && styles.radioSelected,
                ]}
                onPress={() => setFormData({ ...formData, user_type: "user" })}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.user_type === "user" && styles.radioTextSelected,
                  ]}
                >
                  User
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
              {editMode ? "Update User" : "Create User"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation alert */}
      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user?"
      />
    </SafeAreaView>
  );
};

export default Users;
