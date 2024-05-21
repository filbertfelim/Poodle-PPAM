import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SeekerTabs from "./profile/_layout";
import EditCV from "./profile/edit-cv";
import EditPortfolio from "./profile/edit-portfolio";
import Boards from "../(owner)/boards/boards";
import AddBoard from "../(owner)/boards/add-board";
import KanbanBoard from "../(owner)/boards/kanban-board";
import AddActivity from "../(owner)/activity/add-activity";
import EditActivity from "../(owner)/activity/edit-activity";
import ApplicationDetails from "./project/[application_id]";

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={SeekerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ApplicationDetails"
        component={ApplicationDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditCV"
        component={EditCV}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="EditPortfolio"
        component={EditPortfolio}
        options={{ headerShown: false, presentation: "modal" }}
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
