import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OwnerTabs from "./project/_layout";
import AddProjectScreen from "./project/add-project";
import Boards from "./boards/boards";
import AddBoard from "./boards/add-board";
import KanbanBoard from "./boards/kanban-board";
import AddActivity from "./activity/add-activity";
import EditActivity from "./activity/edit-activity";
import ProjectDetails from "./project/project-details";
import ProjectApplicant from "./project/applicant/[applicant_id]";
import YourProjectScreen from "./project/your-project";

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={OwnerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProject"
        component={AddProjectScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProjectApplicant"
        component={ProjectApplicant}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Boards"
        component={Boards}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddBoard"
        component={AddBoard}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="KanbanBoard"
        component={KanbanBoard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivity}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="EditActivity"
        component={EditActivity}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
