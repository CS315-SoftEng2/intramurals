import { BaseToast, ErrorToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        height: 80,
        borderLeftColor: "#22C55E",
        backgroundColor: "#2D2F3C",
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
        color: "#CDD6F4",
        lineHeight: 22,
      }}
      text2Style={{
        fontSize: 15,
        color: "#A6ADC8",
        lineHeight: 20,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        backgroundColor: "#2D2F3C",
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
        color: "#FFF",
        lineHeight: 22,
      }}
      text2Style={{
        fontSize: 15,
        color: "#F87171",
        lineHeight: 20,
      }}
    />
  ),
};

export default toastConfig;
