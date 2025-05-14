import Toast from "react-native-toast-message";

export const handleLogout = (logout) => {
  Toast.show({
    type: "success",
    text1: "Logged Out",
    text2: "You have been logged out successfully.",
  });
  logout();
};
