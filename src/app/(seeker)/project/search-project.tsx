import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { FlatList, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { ActivityIndicator, Searchbar, Text } from "react-native-paper";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

export default function SearchProject() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [projects, setProjects] = useState<ProjectInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getProjects = async () => {
    setLoading(true);
    try {
      const { data: applicationData } = await supabase
        .from("Application")
        .select("project_id")
        .eq("seeker_id", user.user_id);

      var applicationIds = applicationData
        ? applicationData?.map((data) => data.project_id)
        : [];
      const applicationIdsString =
        applicationIds.length > 0 ? `(${applicationIds.join(",")})` : "()";

      const { data, error } = await supabase
        .from("Project")
        .select("*")
        .eq("project_status", "available")
        .not("project_id", "in", applicationIdsString)
        .order("project_date_created", { ascending: false });
      if (error) throw new Error(error.message);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getProjects();
    }
  }, [user?.user_id, isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.user_id) {
      await getProjects();
    }
    setRefreshing(false);
  };

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
            name: "ProjectSearchDetails",
            params: { projectId: item.project_id },
          })
        );
      }}
    >
      <Text style={styles.projectTitle}>{item.project_title}</Text>
      <View style={styles.statusWrapper}>
        {item.project_status === "available" && (
          <View style={styles.statusContainerAvailable}>
            <Text style={styles.statusTextAvailable}>Available</Text>
          </View>
        )}
        {item.project_status === "in review" && (
          <View style={styles.statusContainerInReview}>
            <Text style={styles.statusTextInReview}>In Review</Text>
          </View>
        )}
        {item.project_status === "unavailable" && (
          <View style={styles.statusContainerUnavailable}>
            <Text style={styles.statusTextUnavailable}>Unavailable</Text>
          </View>
        )}
      </View>
      <Text style={styles.projectFee}>
        <Text>Fee : </Text>
        <Text style={styles.numberFee}>{formatFee(item.project_fee)}</Text>
      </Text>
      <Text style={styles.projectDesc} numberOfLines={3}>
        {item.project_desc}
      </Text>
    </Pressable>
  );

  const filteredProjects = projects.filter((project) =>
    project.project_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={styles.textHeader}>
          Search Projects
        </Text>
      </View>
      <Searchbar
        style={styles.searchContainer}
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        mode="bar"
        inputStyle={styles.searchText}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#471D67" />
        </View>
      ) : filteredProjects.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredProjects}
          keyExtractor={(item) => item.project_id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.bodyContainer}>
          <Text style={styles.noProjects}>
            {"You don't have any projects.\nLet's create a new project!"}
          </Text>
        </View>
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
    marginTop: 25,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  textHeader: {
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  searchText: {
    fontFamily: "Inter",
    fontWeight: "700",
    color: "#000",
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
    justifyContent: "center",
    alignItems: "center",
  },
  noProjects: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "bold",
    color: "#471D67",
  },
  statusWrapper: {
    alignItems: "flex-start",
    marginVertical: 5,
    justifyContent: "space-between",
  },
  statusContainerAvailable: {
    alignItems: "center",
    backgroundColor: "#E0ECFD",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextAvailable: {
    color: "#151970",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusContainerInReview: {
    alignItems: "center",
    backgroundColor: "#FFFCBE",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextInReview: {
    color: "#C67243",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusContainerUnavailable: {
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextUnavailable: {
    color: "#646464",
    fontWeight: "bold",
    fontSize: 12,
  },
});
