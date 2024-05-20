import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text, RadioButton } from "react-native-paper";
import { View } from "@/components/Themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";

interface ActivityDetails {
  activityName: string;
  activityDesc: string;
  activityStartDate: string;
  activityEndDate: string;
  activityStatus: string;
}

export default function AddActivity() {
  const { boardId } = useLocalSearchParams();
  const navigation = useNavigation();

  const [activity, setActivity] = useState<ActivityDetails>({
    activityName: "",
    activityDesc: "",
    activityStartDate: "",
    activityEndDate: "",
    activityStatus: "",
  });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
  };

  const confirmIOSStartDate = () => {
    handleChange("activityStartDate", formatDate(startDate));
    toggleStartDatePicker();
  };

  const confirmIOSEndDate = () => {
    handleChange("activityEndDate", formatDate(endDate));
    toggleEndDatePicker();
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

  const onStartDateChange = ({ type }: any, selectedDate: any) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setStartDate(currentDate);
      if (Platform.OS === "android") {
        toggleStartDatePicker();
        handleChange("activityStartDate", formatDate(currentDate));
      }
    } else {
      toggleStartDatePicker();
    }
  };

  const onEndDateChange = ({ type }: any, selectedDate: any) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setEndDate(currentDate);
      if (Platform.OS === "android") {
        toggleEndDatePicker();
        handleChange("activityEndDate", formatDate(currentDate));
      }
    } else {
      toggleEndDatePicker();
    }
  };

  const handleChange = (name: keyof ActivityDetails, value: string) => {
    setActivity((prev) => ({ ...prev, [name]: value }));
  };

  const isButtonDisabled = !activity.activityName || !activity.activityStatus;

  async function handleAddActivity() {
    try {
      const { data, error } = await supabase.from("Activity").insert([
        {
          activity_name: activity.activityName,
          activity_desc:
            activity.activityDesc === "" ? null : activity.activityDesc,
          activity_status: activity.activityStatus,
          activity_startdate:
            activity.activityStartDate === ""
              ? null
              : convertToIsoDate(activity.activityStartDate),
          activity_enddate:
            activity.activityEndDate === ""
              ? null
              : convertToIsoDate(activity.activityEndDate),
          board_id: boardId,
        },
      ]);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error creating activity: ${errorMessage}`);
      }
      console.log("Activity created successfully:", data);
      navigation.goBack();
      setActivity({
        activityName: "",
        activityDesc: "",
        activityStartDate: "",
        activityEndDate: "",
        activityStatus: "",
      });
    } catch (error) {
      console.error("Failed to create activity:", error);
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
          Create Activity
        </Text>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.inputTitle}>Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter activity name"
            value={activity.activityName}
            onChangeText={(value) => handleChange("activityName", value)}
            maxLength={80}
          />
          <Text style={styles.inputTitle}>Activity Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter activity description"
            value={activity.activityDesc}
            onChangeText={(value) => handleChange("activityDesc", value)}
            maxLength={80}
          />
          <Text style={styles.inputTitle}>Activity Start Date</Text>
          {showStartDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={startDate}
              onChange={onStartDateChange}
              style={styles.datePicker}
            />
          )}
          {showStartDatePicker && Platform.OS === "ios" && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#E6E6E6",
                    paddingHorizontal: 15,
                    paddingVertical: 6,
                    marginTop: 0,
                  },
                ]}
                onPress={toggleStartDatePicker}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#E6E6E6",
                    paddingHorizontal: 15,
                    paddingVertical: 6,
                    marginTop: 0,
                  },
                ]}
                onPress={confirmIOSStartDate}
              >
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
          <Pressable onPress={toggleStartDatePicker}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={activity.activityStartDate}
              onChangeText={(value) => handleChange("activityStartDate", value)}
              editable={false}
              onPressIn={toggleStartDatePicker}
            />
          </Pressable>
          <Text style={styles.inputTitle}>Activity End Date</Text>
          {showEndDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={endDate}
              onChange={onEndDateChange}
              minimumDate={startDate}
              style={styles.datePicker}
            />
          )}
          {showEndDatePicker && Platform.OS === "ios" && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#E6E6E6",
                    paddingHorizontal: 15,
                    paddingVertical: 6,
                    marginTop: 0,
                  },
                ]}
                onPress={toggleEndDatePicker}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#E6E6E6",
                    paddingHorizontal: 15,
                    paddingVertical: 6,
                    marginTop: 0,
                  },
                ]}
                onPress={confirmIOSEndDate}
              >
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
          <Pressable onPress={toggleEndDatePicker}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={activity.activityEndDate}
              onChangeText={(value) => handleChange("activityEndDate", value)}
              editable={false}
              onPressIn={toggleEndDatePicker}
            />
          </Pressable>
          <Text style={styles.inputTitle}>Activity Status</Text>
          <RadioButton.Group
            onValueChange={(value) => handleChange("activityStatus", value)}
            value={activity.activityStatus}
          >
            <RadioButton.Item label="To do" value="todo" mode="android" />
            <RadioButton.Item
              label="In Progress"
              value="in progress"
              mode="android"
            />
            <RadioButton.Item label="Done" value="done" mode="android" />
          </RadioButton.Group>
          <Button
            mode="contained"
            style={[styles.button, isButtonDisabled && styles.disabledButton]}
            onPress={handleAddActivity}
            disabled={isButtonDisabled}
          >
            <Text
              style={[
                styles.buttonText,
                isButtonDisabled && styles.disabledButtonText,
              ]}
            >
              Create Activity
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
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    marginLeft: 10,
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
  datePicker: {
    height: 150,
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
