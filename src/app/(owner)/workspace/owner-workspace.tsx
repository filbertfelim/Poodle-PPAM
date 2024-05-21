import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface WorkspaceInterface {
  workspace_id: number;
  workspace_name: string;
  workspace_type: string;
  project_id: number;
  user_id: string;
  seeker_id: string;
}

export default function Workspace() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [workspaces, setWorkspaces] = useState<WorkspaceInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getWorkspaces = async (ownerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Workspace")
        .select("*")
        .or(`user_id.eq.${ownerId},seeker_id.eq.${ownerId}`)
        .order("workspace_type", { ascending: true })
        .order("workspace_id", { ascending: false });
      if (error) throw new Error(error.message);
      setWorkspaces(data);
      console.log("Success fetching workspace data");
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getWorkspaces(user.user_id);
    }
  }, [user?.user_id, isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.user_id) {
      await getWorkspaces(user.user_id);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: WorkspaceInterface }) => (
    <Pressable
      style={styles.workspaceItem}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: "Boards",
            params: {
              workspaceId: item.workspace_id,
              workspaceName: item.workspace_name,
            },
          })
        );
      }}
    >
      <View style={styles.workspaceTitleContainer}>
        <Text style={styles.workspaceTitle}>{item.workspace_name}</Text>
        {item.workspace_type === "private" && (
          <Icon name="lock" size={20} color="#000" style={styles.icon} />
        )}
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
        <Text variant="headlineSmall" style={styles.textHeader}>
          Your Workspaces
        </Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#471D67" />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={workspaces}
          keyExtractor={(item) => item.workspace_id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textHeader: {
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: "bold",
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
  },
  workspaceItem: {
    flexDirection: "column",
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    gap: 6,
  },
  workspaceTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bodyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noWorkspaces: {
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
  workspaceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
