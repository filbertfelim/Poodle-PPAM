import React, { useCallback, useState } from "react";
import { StyleSheet, ScrollView, Pressable, Platform, TouchableOpacity } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { View } from "@/components/Themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";
import moment from "moment-timezone";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ProjectDetails {
  projectName: string;
  deadline: string;
  fee: string;
  description: string;
}

export default function AddProjectScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [project, setProject] = useState<ProjectDetails>({
    projectName: "",
    deadline: "",
    fee: "",
    description: "",
  });

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setProject({
          projectName: "",
          deadline: "",
          fee: "",
          description: "",
        });
      };
    }, [])
  );

  const goBack = () => {
    navigation.goBack();
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const confirmIOSDate = () => {
    handleChange("deadline", formatDate(date));
    toggleDatePicker();
  }

  const capitalizeWords = (sentence: string) => {
    return sentence.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };  

  const formatDate = (rawDate: Date) => {
    let date = new Date(rawDate);
    let year: number = date.getFullYear();
    let month: string = (date.getMonth() + 1).toString().padStart(2, "0");
    let day: string = date.getDate().toString().padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  function convertToIsoDate(dateString: string): string | null {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  }

  const onChange = ({ type }: any, selectedDate: any) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === "android") {
        toggleDatePicker();
        handleChange("deadline", formatDate(currentDate));
      }
    } else {
      toggleDatePicker();
    }
  };

  const handleChange = (name: keyof ProjectDetails, value: string) => {
    if (name === "fee") {
      let formattedValue = value;
      formattedValue = Number(value).toLocaleString("id-ID");
      setProject((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isButtonDisabled =
    !project.projectName ||
    !project.deadline ||
    !project.fee ||
    !project.description;

  async function handlePostProject() {
    const localDateTime = moment().tz(moment.tz.guess()).format();
    try {
      const isoDeadline = convertToIsoDate(project.deadline);
      const numericFee = project.fee.replace(/[^0-9]/g, "");
      const { data, error } = await supabase.from("Project").insert([
        {
          project_title: capitalizeWords(project.projectName),
          project_desc: project.description,
          project_deadline: isoDeadline,
          project_fee: numericFee,
          project_status: "available",
          project_date_created: localDateTime,
          owner_id: user.user_id,
        },
      ]);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error posting project: ${errorMessage}`);
      }
      console.log("Project posted successfully:", data);
      navigation.goBack();
      setProject({
        projectName: "",
        deadline: "",
        fee: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to post project:", error);
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
          Create Project
        </Text>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.inputTitle}>Project Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            value={project.projectName}
            onChangeText={(value) => handleChange("projectName", value)}
            maxLength={80}
          />
          <Text style={styles.inputTitle}>Project Deadline</Text>

          {showPicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={date}
              onChange={onChange}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          )}
          {showPicker && Platform.OS === "ios" &&
          (<View style={{ flexDirection:"row", justifyContent: "space-evenly" }}>
            <TouchableOpacity style={[styles.button, {backgroundColor:"#E6E6E6", paddingHorizontal: 15, paddingVertical: 6, marginTop: 0}]} onPress={toggleDatePicker}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {backgroundColor:"#E6E6E6", paddingHorizontal: 15, paddingVertical: 6, marginTop: 0}]} onPress={confirmIOSDate}>
              <Text>Confirm</Text>
            </TouchableOpacity>
          </View>
          )}
          <Pressable onPress={toggleDatePicker}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={project.deadline}
              onChangeText={(value) => handleChange("deadline", value)}
              editable={false}
              onPressIn={toggleDatePicker}
            />
          </Pressable>

          <Text style={styles.inputTitle}>Project Fee</Text>
          <TextInput
            style={styles.input}
            placeholder="IDR"
            value={project.fee}
            keyboardType="numeric"
            onChangeText={(value) =>
              handleChange("fee", value.replace(/[^0-9]/g, ""))
            }
          />
          <Text style={styles.inputTitle}>Project Description</Text>
          <TextInput
            style={[styles.input, { maxHeight: 380 }]}
            placeholder="Add description"
            value={project.description}
            onChangeText={(value) => handleChange("description", value)}
            multiline={true}
            scrollEnabled={true}
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
              Post Project
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
    marginTop: 32,
    marginBottom: 20,
  },
  header: {
    marginLeft: 15,
    fontWeight: "bold",
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    padding: 8,
  },
  inputTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  input: {
    backgroundColor: "transparent",
    marginBottom: 14,
    fontSize: 15,
    paddingHorizontal: 0,
  },
  datePicker: {
    height: 150
  },
  button: {
    marginTop: 25,
    borderRadius: 12,
    backgroundColor: "#471D67",
    paddingVertical: 2,
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
