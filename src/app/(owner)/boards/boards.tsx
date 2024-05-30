import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import {
  CommonActions,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";

interface BoardInterface {
  board_id: number;
  board_title: string;
  workspace_id: number;
}

export default function Boards() {
  const isFocused = useIsFocused();
  const { workspaceId, workspaceName } = useLocalSearchParams();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [boards, setBoards] = useState<BoardInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getBoards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Board")
        .select("*")
        .eq("workspace_id", workspaceId);
      if (error) throw new Error(error.message);
      setBoards(data);
      console.log("Success fetching board data");
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getBoards();
    }
  }, [user?.user_id, isFocused]);

  const goBack = () => {
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.user_id) {
      await getBoards();
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: BoardInterface }) => (
    <Pressable
      style={styles.boardItem}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: "KanbanBoard",
            params: { boardId: item.board_id, boardTitle: item.board_title },
          })
        );
      }}
    >
      <View style={styles.boardTitleContainer}>
        <Text style={styles.boardTitle}>{item.board_title}</Text>
        <Icon
          name="arrow-right"
          size={20}
          color="#000"
          style={styles.iconRight}
        />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitle}>
          <Pressable onPress={goBack}>
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
          <Text variant="titleMedium" style={styles.textHeader}>
            {workspaceName}
          </Text>
        </View>
        <Pressable
          style={styles.button}
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: "AddBoard",
                params: { workspaceId: workspaceId },
              })
            );
          }}
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#471D67" />
          </View>
        ) : boards.length > 0 ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={boards}
            keyExtractor={(item) => item.board_id.toString()}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : (
          <View style={styles.bodyContainer}>
            <Text style={styles.noBoards}>
              {"You don't have any boards.\nLet's create a new board!"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 20,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textHeader: {
    textAlign: "left",
    fontFamily: "Inter",
    fontWeight: "bold",
    marginLeft: 15,
    flexShrink: 1,
  },
  button: {
    borderRadius: 25,
    backgroundColor: "#F3EDF7",
    borderWidth: 1,
    borderColor: "#471D67",
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginLeft: 3,
  },
  buttonText: {
    color: "#471D67",
    fontSize: 16,
    fontWeight: "bold",
  },
  boardItem: {
    flexDirection: "column",
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    gap: 6,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bodyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  noBoards: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "bold",
    color: "#471D67",
  },
  icon: {
    marginLeft: 10,
    color: "#777777",
  },
  iconRight: {
    marginLeft: "auto",
  },
  boardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
});