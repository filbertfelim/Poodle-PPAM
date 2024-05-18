import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { Pressable, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function YourProjectScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={styles.textHeader}>
          Your Project
        </Text>
        <Pressable
          onPress={() => {
            console.log("Pressed!");
            navigation.navigate("AddProject" as never);
          }}
        >
          <Text>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 20,
  },
  textHeader: {
    fontWeight: "bold",
  },
  button: {
    borderRadius: 25,
    backgroundColor: "#F3EDF7",
    borderColor: "#471D67",
    justifyContent: "flex-end",
  },
  buttonText: {
    backgroundColor: "#F3EDF7",
    color: "#471D67",
    fontSize: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 25,
    fontWeight: "bold",
  },
});
