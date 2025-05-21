import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  Animated,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import styles from "../../assets/styles/matchStyles";

const StyledPicker = ({
  selectedValue,
  onValueChange,
  items,
  placeholder,
  disabled,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const openModal = () => {
    if (disabled) return;
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleSelect = (value) => {
    onValueChange(value);
    closeModal();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={styles.pickerItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.input, disabled && styles.disabledInput]}
        onPress={openModal}
        disabled={disabled}
      >
        <Text
          style={[
            styles.pickerText,
            selectedValue ? styles.selectedText : styles.placeholderText,
          ]}
        >
          {items.find((item) => item.value === selectedValue)?.label ||
            placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={disabled ? "#45475A" : "#A6ADC8"}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.pickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Value Below</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="#A6ADC8" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              style={styles.pickerList}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={closeModal}
                style={styles.pickerDoneButton}
              >
                <Text style={styles.pickerDoneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default StyledPicker;
