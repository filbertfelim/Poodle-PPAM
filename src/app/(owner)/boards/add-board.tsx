import React, { useState } from "react";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";

interface BoardDetails {
  boardTitle: string;
}

export default function AddBoard() {
  const { workspaceId } = useLocalSearchParams();
  const navigation = useNavigation();

  const [board, setBoard] = useState<BoardDetails>({
    boardTitle: "",
  });

  const goBack = () => {
    navigation.goBack();
  };

  const capitalizeWords = (sentence: string) => {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleChange = (name: keyof BoardDetails, value: string) => {
    setBoard((prev) => ({ ...prev, [name]: value }));
  };

  const isButtonDisabled = !board.boardTitle;

  async function handlePostProject() {
    try {
      const { data, error } = await supabase.from("Board").insert([
        {
          board_title: capitalizeWords(board.boardTitle),
          workspace_id: workspaceId,
        },
      ]);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error creating board: ${errorMessage}`);
      }
      console.log("Board created successfully:", data);
      navigation.goBack();
      setBoard({
        boardTitle: "",
      });
    } catch (error) {
      console.error("Failed to create board:", error);
      throw error;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={goBack}>
          <Icon name="chevron-left" color="#471D67" size={30} />
        </Pressable>
        <Text variant="headlineSmall" style={styles.header}>
          Create Board
        </Text>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.inputTitle}>Board Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter board title"
            value={board.boardTitle}
            onChangeText={(value) => handleChange("boardTitle", value)}
            maxLength={80}
            multiline={true}
          />
          <Button
            mode="contained"
            style={[styles.button, isButtonDisabled && styles.disabledButton]}
            onPress={handlePostProject}
            disabled={isButtonDisabled}
          >
            <Text
              style={[
                styles.buttonText,
                isButtonDisabled && styles.disabledButtonText,
              ]}
            >
              Create Board
            </Text>
          </Button>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 18,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 20,
  },
  header: {
    marginLeft: 15,
    textAlign: "left",
    fontWeight: "bold",
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    padding: 10,
  },
  inputTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  input: {
    backgroundColor: "transparent",
    marginBottom: 10,
    fontSize: 15,
    paddingHorizontal: 0,
  },
  button: {
    marginTop: 25,
    borderRadius: 12,
    backgroundColor: "#471D67",
    paddingVertical: 4,
  },
  disabledButton: {
    backgroundColor: "#E6E6E6",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "medium",
  },
  disabledButtonText: {
    color: "#A2A2A2",
    fontSize: 16,
    fontWeight: "medium",
  },
});
