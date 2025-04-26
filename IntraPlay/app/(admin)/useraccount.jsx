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
} from "react-native";
import LoadingIndicator from "../components/LoadingIndicator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useMemo } from "react";
import Modal from "react-native-modal";
import globalstyles from "../../assets/styles/globalstyles";
import GET_USERS from "../../queries/userAccountQuery";
import {
  ADD_USER,
  UPDATE_USER,
  DELETE_USER,
} from "../../mutations/userAccountMutation";
import Toast from "react-native-toast-message";
import CustomAlert from "../components/customAlert";

const { width } = Dimensions.get("window");

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
          <Text style={styles.userId}>User ID: {item.user_id}</Text>
        </View>
      </View>
      <View
        style={[
          styles.tagContainer,
          item.user_type === "admin" ? styles.adminTag : styles.userTag,
        ]}
      >
        <Text style={styles.tag}>{item.user_type.toUpperCase()}</Text>
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
        onPress={() => onDelete(item.user_id)}
      >
        <MaterialIcons name="delete" size={16} color="#F38BA8" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Users = () => {
  const { loading, error, data, refetch } = useQuery(GET_USERS);
  const [addUser] = useMutation(ADD_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

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
  }, [data, sortOrder, searchQuery]);

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

    if (!formData.password.trim()) {
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
      await deleteUser({ variables: { adminId: 1, userId: deleteUserId } });
      Toast.show({
        type: "success",
        text1: "User deleted",
        text2: "The user was successfully deleted.",
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
    setFormData({ user_name: user.user_name, user_type: user.user_type });
    setEditMode(true);
    setEditUserId(user.user_id);
    setModalVisible(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const openAddUserModal = () => {
    setFormData({ user_name: "", user_type: "user" });
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
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.subtitle}>
          {filteredAndSortedUsers.length} user
          {filteredAndSortedUsers.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#A6ADC8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
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

          <TouchableOpacity onPress={openAddUserModal} style={styles.addButton}>
            <MaterialIcons name="person-add" size={18} color="#1E1E2E" />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

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
              placeholderTextColor="#A6ADC8"
            />
            <Text style={styles.formLabel}>Password</Text>
            <TextInput
              placeholder="Enter password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              style={styles.input}
              placeholderTextColor="#A6ADC8"
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

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.user_type === "admin" && styles.radioSelected,
                ]}
                onPress={() => setFormData({ ...formData, user_type: "admin" })}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.user_type === "admin" && styles.radioTextSelected,
                  ]}
                >
                  Admin
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#89B4FA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E2E",
  },
  userTextInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#CDD6F4",
  },
  userId: {
    color: "#A6ADC8",
    fontSize: 12,
    marginTop: 2,
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminTag: {
    backgroundColor: "#F5C2E7",
  },
  userTag: {
    backgroundColor: "#89B4FA",
  },
  tag: {
    color: "#1E1E2E",
    fontSize: 12,
    fontWeight: "600",
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
  radioContainer: {
    flexDirection: "row",
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#45475A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "#89B4FA",
    borderColor: "#89B4FA",
  },
  radioText: {
    color: "#CDD6F4",
    fontSize: 14,
  },
  radioTextSelected: {
    color: "#1E1E2E",
    fontWeight: "600",
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
