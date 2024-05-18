import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProjectTabs from "./project/_layout";
import AddProjectScreen from "./project/add-project";

interface RouteParams {
  key: string;
  name: string;
  params?: {
    [key: string]: any;
  };
  state?: any;
  title?: string;
}

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={ProjectTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProject"
        component={AddProjectScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
