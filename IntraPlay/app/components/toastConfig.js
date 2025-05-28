import { BaseToast, ErrorToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        height: 80,
        borderLeftColor: "#16A34A",
        backgroundColor: "#2A2A3C",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 12,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        lineHeight: 22,
      }}
      text2Style={{
        fontSize: 15,
        color: "#aaa",
        lineHeight: 20,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        backgroundColor: "#2A2A3C",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 15,
      }}
      text1Style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        lineHeight: 22,
      }}
      text2Style={{
        fontSize: 15,
        color: "#aaa",
        lineHeight: 20,
      }}
    />
  ),
};

export default toastConfig;
