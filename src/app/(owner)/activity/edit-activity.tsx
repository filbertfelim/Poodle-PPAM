import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  RadioButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { View } from "@/components/Themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";

interface ActivityDetails {
  activityLastName: string;
  activityLastDesc: string;
  activityLastStartDate: string;
  activityLastEndDate: string;
  activityLastStatus: string;
}

export default function EditActivity() {
  const {
    boardId,
    activityId,
    activityName,
    activityDesc,
    activityStartDate,
    activityEndDate,
    activityStatus,
  } = useLocalSearchParams();
  const navigation = useNavigation();

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

  const parseDate = (dateString: string): Date | null => {
    const [day, month, year] = dateString.split("/");
    if (!day || !month || !year) return null;

    const date = new Date(convertToIsoDate(dateString) as string);
    return isNaN(date.getTime()) ? null : date;
  };

  const [activity, setActivity] = useState<ActivityDetails>({
    activityLastName: activityName as string,
    activityLastDesc: activityDesc as string,
    activityLastStartDate: activityStartDate as string,
    activityLastEndDate: activityEndDate as string,
    activityLastStatus: activityStatus as string,
  });

  const [startDate, setStartDate] = useState(
    activityStartDate === ""
      ? new Date()
      : parseDate(activityStartDate as string)
  );
  const [endDate, setEndDate] = useState(
    activityEndDate === "" ? startDate : parseDate(activityEndDate as string)
  );
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
    handleChange("activityLastStartDate", formatDate(startDate as Date));
    toggleStartDatePicker();
  };

  const confirmIOSEndDate = () => {
    handleChange("activityLastEndDate", formatDate(endDate as Date));
    toggleEndDatePicker();
  };

  const onStartDateChange = ({ type }: any, selectedDate: any) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setStartDate(currentDate);
      if (Platform.OS === "android") {
        toggleStartDatePicker();
        handleChange("activityLastStartDate", formatDate(currentDate));
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
        handleChange("activityLastEndDate", formatDate(currentDate));
      }
    } else {
      toggleEndDatePicker();
    }
  };

  const handleChange = (name: keyof ActivityDetails, value: string) => {
    setActivity((prev) => ({ ...prev, [name]: value }));
  };

  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const isButtonDisabled = !activity.activityLastName;

  async function handleAddActivity() {
    try {
      const { data, error } = await supabase
        .from("Activity")
        .update([
          {
            activity_name: activity.activityLastName,
            activity_desc:
              activity.activityLastDesc === ""
                ? null
                : activity.activityLastDesc,
            activity_status: activity.activityLastStatus,
            activity_startdate:
              activity.activityLastStartDate === ""
                ? null
                : convertToIsoDate(activity.activityLastStartDate),
            activity_enddate:
              activity.activityLastEndDate === ""
                ? null
                : convertToIsoDate(activity.activityLastEndDate),
            board_id: boardId,
          },
        ])
        .eq("activity_id", activityId as unknown as number);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error editing activity: ${errorMessage}`);
      }
      console.log("Activity edited successfully:", data);
      navigation.goBack();
      setActivity({
        activityLastName: "",
        activityLastDesc: "",
        activityLastStartDate: "",
        activityLastEndDate: "",
        activityLastStatus: "",
      });
    } catch (error) {
      console.error("Failed to edit activity:", error);
      throw error;
    }
  }

  async function handleDelete() {
    try {
      const { data, error } = await supabase
        .from("Activity")
        .delete()
        .eq("activity_id", activityId as unknown as number);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error delete activity: ${errorMessage}`);
      }
      console.log("Activity deleted successfully:", data);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to delete activity:", error);
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
          {activityName}
        </Text>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.inputTitle}>Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter activity name"
            value={activity.activityLastName}
            onChangeText={(value) => handleChange("activityLastName", value)}
            maxLength={80}
            multiline={true}
          />
          <Text style={styles.inputTitle}>Activity Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter activity description"
            value={activity.activityLastDesc}
            onChangeText={(value) => handleChange("activityLastDesc", value)}
            maxLength={150}
            multiline={true}
          />
          <Text style={styles.inputTitle}>Activity Start Date</Text>
          {showStartDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={startDate as Date}
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
              value={activity.activityLastStartDate}
              onChangeText={(value) =>
                handleChange("activityLastStartDate", value)
              }
              editable={false}
              onPressIn={toggleStartDatePicker}
            />
          </Pressable>
          <Text style={styles.inputTitle}>Activity End Date</Text>
          {showEndDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={endDate as Date}
              onChange={onEndDateChange}
              minimumDate={startDate as Date}
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
              value={activity.activityLastEndDate}
              onChangeText={(value) =>
                handleChange("activityLastEndDate", value)
              }
              editable={false}
              onPressIn={toggleEndDatePicker}
            />
          </Pressable>
          <Text style={styles.inputTitle}>Activity Status</Text>
          <RadioButton.Group
            onValueChange={(value) => handleChange("activityLastStatus", value)}
            value={activity.activityLastStatus}
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
              Update Activity
            </Text>
          </Button>
          <Button
            mode="outlined"
            style={styles.buttonDelete}
            onPress={showDialog}
          >
            <Text style={styles.buttonTextDelete}>Delete Activity</Text>
          </Button>
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={{
                backgroundColor: "#F3EDF7",
                width: "75%",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Dialog.Icon icon="delete" size={45} color="red" />
              <Dialog.Title style={styles.dialogTitle}>
                Are you sure?
              </Dialog.Title>
              <Dialog.Content style={styles.dialogContent}>
                <Text style={styles.dialogDesc}>
                  Do you really want to delete this task? This process cannot be
                  undone.
                </Text>
              </Dialog.Content>
              <Dialog.Actions style={styles.buttonAction}>
                <Button onPress={hideDialog} style={styles.dialogNoButton}>
                  <Text style={styles.dialogNo}>Cancel</Text>
                </Button>
                <Button
                  style={styles.dialogYesButton}
                  onPress={() => {
                    hideDialog();
                    handleDelete();
                  }}
                >
                  <Text style={styles.dialogYes}>Delete</Text>
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
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
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: "#471D67",
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
  buttonDelete: {
    marginTop: 15,
    borderRadius: 20,
    borderColor: "#E62323",
  },
  buttonTextDelete: {
    color: "#E62323",
    fontSize: 16,
    fontWeight: "medium",
  },
  dialogTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 0,
  },
  dialogDesc: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: 400,
    textAlign: "center",
    marginBottom: 0,
  },
  dialogContent: {
    marginTop: 10,
  },
  dialogYes: {
    color: "red",
    fontWeight: "bold",
  },
  dialogNo: {
    color: "#471D67",
    fontWeight: "bold",
  },
  dialogYesButton: {
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  dialogNoButton: {
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  buttonAction: {
    gap: 12,
  },
});
