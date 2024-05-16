import { createStackNavigator } from "@react-navigation/stack";
import YourProjectScreen from "./your-project";
import AddProjectScreen from "./add-project";
import React from "react";

const Stack = createStackNavigator();

export default function ProjectsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="YourProject"
        component={YourProjectScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProject"
        component={AddProjectScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
