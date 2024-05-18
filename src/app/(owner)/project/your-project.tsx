import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { FlatList, Pressable, StyleSheet, RefreshControl } from "react-native";
import { Text } from "react-native-paper";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

interface ProjectInterface {
  project_id: number;
  project_title: string;
  project_desc: string;
  project_deadline: Date;
  project_fee: number;
  project_status: string;
  project_date_created: string;
  owner_id: string;
}

export default function YourProjectScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [projects, setProjects] = useState<ProjectInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getProjects = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from("Project")
        .select("*")
        .eq("owner_id", ownerId)
        .order("project_date_created", { ascending: false });
      if (error) throw new Error(error.message);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      getProjects(user.user_id);
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        getProjects(user.user_id);
      }
    }, [user?.user_id])
  );

  const onRefresh = useCallback(() => {
    if (user?.user_id) {
      setRefreshing(true);
      getProjects(user.user_id).then(() => setRefreshing(false));
    }
  }, [user?.user_id]);

  const formatFee = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const renderItem = ({ item }: { item: ProjectInterface }) => (
    <Pressable
      style={styles.projectItem}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: "ProjectDetails",
            params: { projectId: item.project_id },
          })
        );
      }}
    >
      <Text style={styles.projectTitle}>{item.project_title}</Text>
      <Text style={styles.projectFee}>
        <Text>Fee : </Text>
        <Text style={styles.numberFee}>{formatFee(item.project_fee)}</Text>
      </Text>
      <Text style={styles.projectDesc} numberOfLines={3}>
        {item.project_desc}
      </Text>
    </Pressable>
  );

  if (projects) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall" style={styles.textHeader}>
            Your Project
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => {
              navigation.navigate("AddProject" as never);
            }}
          >
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={projects}
          keyExtractor={(item) => item.project_id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall" style={styles.textHeader}>
            Your Project
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => {
              navigation.navigate("AddProject" as never);
            }}
          >
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
        </View>
        <View style={styles.bodyContainer}>
            <Text style={styles.noProjects}>
              {"You don't have any projects.\nLet's create a new project!"}
            </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 25,
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
  projectItem: {
    flexDirection: "column",
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    gap: 6,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  projectFee: {
    fontSize: 13,
  },
  numberFee: {
    color: "#4E833C",
    fontWeight: "bold",
  },
  projectDesc: {
    color: "#777777",
    fontSize: 12,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noProjects: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: 'bold',
    color: '#471D67',
  }
});
