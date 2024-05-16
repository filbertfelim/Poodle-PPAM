import { createStackNavigator } from "@react-navigation/stack";
import OwnerProfile from "./owner-profile";

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={OwnerProfile}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
