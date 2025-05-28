// React and library imports
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

// Components
import LoadingIndicator from "../../components/LoadingIndicator";
import CustomAlert from "../../components/customAlert";

// Styles
import styles from "../../../assets/styles/matchStyles";

// Queries
import GET_CATEGORIES from "../../../queries/categoriesQuery";

// Mutations
import {
  ADD_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../../../mutations/categoryMutation";

const Category = () => {
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
              placeholderTextColor="#aaa"
            />
            <Text style={styles.formLabel}>Division</Text>
            <TextInput
              placeholder="Enter division"
              value={formData.division}
              onChangeText={(text) =>
                setFormData({ ...formData, division: text })
              }
              style={styles.input}
              placeholderTextColor="#aaa"
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

export default Category;
