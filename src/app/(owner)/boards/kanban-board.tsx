import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ActivityInterface {
  activity_id: number;
  activity_name: string;
  activity_desc: string;
  activity_startdate: Date;
  activity_enddate: Date;
  activity_status: string;
  board_id: number;
}

const screenWidth = Dimensions.get("window").width;
const columnWidth = screenWidth * 0.9;
const sideMargin = (screenWidth - columnWidth) / 2;

export default function KanbanBoard() {
  const isFocused = useIsFocused();
  const { boardId, boardTitle } = useLocalSearchParams();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [todoActivity, setTodoActivity] = useState<ActivityInterface[]>([]);
  const [inProgressActivity, setInProgressActivity] = useState<
    ActivityInterface[]
  >([]);
  const [doneActivity, setDoneActivity] = useState<ActivityInterface[]>([]);
  const [loadingTodo, setLoadingTodo] = useState(true);
  const [loadingInProgress, setLoadingInProgress] = useState(true);
  const [loadingDone, setLoadingDone] = useState(true);

  const goBack = () => {
    navigation.goBack();
  };

  const getToDoActivity = async () => {
    setLoadingTodo(true);
    try {
      const { data, error } = await supabase
        .from("Activity")
        .select("*")
        .eq("board_id", boardId)
        .eq("activity_status", "todo");
      if (error) throw new Error(error.message);
      setTodoActivity(data);
    } catch (error) {
      console.error("Error fetching to do activity:", error);
    } finally {
      setLoadingTodo(false);
    }
  };
  const getInProgressActivity = async () => {
    setLoadingInProgress(true);
    try {
      const { data, error } = await supabase
        .from("Activity")
        .select("*")
        .eq("board_id", boardId)
        .eq("activity_status", "in progress");
      if (error) throw new Error(error.message);
      setInProgressActivity(data);
    } catch (error) {
      console.error("Error fetching in progress activity:", error);
    } finally {
      setLoadingInProgress(false);
    }
  };
  const getDoneActivity = async () => {
    setLoadingDone(true);
    try {
      const { data, error } = await supabase
        .from("Activity")
        .select("*")
        .eq("board_id", boardId)
        .eq("activity_status", "done");
      if (error) throw new Error(error.message);
      setDoneActivity(data);
    } catch (error) {
      console.error("Error fetching done activity:", error);
    } finally {
      setLoadingDone(false);
    }
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getToDoActivity();
      getInProgressActivity();
      getDoneActivity();
    }
  }, [user?.user_id, isFocused]);

  const formatDate = (rawDate: Date) => {
    let date = new Date(rawDate);
    let year: number = date.getFullYear();
    let month: string = (date.getMonth() + 1).toString().padStart(2, "0");
    let day: string = date.getDate().toString().padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const renderActivity = (activity: ActivityInterface) => (
    <Pressable
      key={activity.activity_id}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: "EditActivity",
            params: {
              boardId: boardId,
              activityId: activity.activity_id,
              activityName: activity.activity_name,
              activityDesc: activity.activity_desc
                ? activity.activity_desc
                : "",
              activityStartDate: activity.activity_startdate
                ? formatDate(activity.activity_startdate)
                : "",
              activityEndDate: activity.activity_enddate
                ? formatDate(activity.activity_enddate)
                : "",
              activityStatus: activity.activity_status,
            },
          })
        );
      }}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.cardText}>{activity.activity_name}</Text>
          <Icon name="chevron-right" color="#000" size={20} />
        </Card.Content>
      </Card>
    </Pressable>
  );

  const renderColumnContent = (
    loading: boolean,
    activities: ActivityInterface[]
  ) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#471D67" />
        </View>
      );
    }

    if (activities.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.columnText}>No activities available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.activityScrollView}>
        {activities.map(renderActivity)}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitle}>
          <Pressable onPress={goBack}>
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.textHeader}>
            {boardTitle}
          </Text>
        </View>
        <Pressable
          style={styles.button}
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: "AddActivity",
                params: { boardId: boardId },
              })
            );
          }}
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View
          style={[
            styles.column,
            { width: columnWidth, marginHorizontal: sideMargin },
          ]}
        >
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>To Do</Text>
          </View>
          {renderColumnContent(loadingTodo, todoActivity)}
        </View>
        <View
          style={[
            styles.column,
            { width: columnWidth, marginHorizontal: sideMargin },
          ]}
        >
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>In Progress</Text>
          </View>
          {renderColumnContent(loadingInProgress, inProgressActivity)}
        </View>
        <View
          style={[
            styles.column,
            { width: columnWidth, marginHorizontal: sideMargin },
          ]}
        >
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>Done</Text>
          </View>
          {renderColumnContent(loadingDone, doneActivity)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 25,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 10,
    marginHorizontal: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textHeader: {
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: "bold",
    marginLeft: 15,
  },
  button: {
    borderRadius: 25,
    backgroundColor: "#F3EDF7",
    borderWidth: 1,
    borderColor: "#471D67",
    paddingHorizontal: 12,
    paddingVertical: 2,
    justifyContent: "flex-end",
  },
  buttonText: {
    color: "#471D67",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  activityScrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  column: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  columnTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Inter",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
    fontFamily: "Inter",
  },
  columnText: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: 500,
  },
});
