import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';
import ListScreen from '../screens/ListScreen';
import MapScreen from '../screens/MapScreen';
import ParkingDetailScreen from '../screens/ParkingDetailScreen';

export type RootStackParamList = {
    PublicParkings: undefined;
    ParkingDetail: { parkingId: number };
};

export type PublicTabsParamList = {
    Map: undefined;
    List: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<PublicTabsParamList>();

function PublicTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: COLORS.tertiary },
                headerTintColor: COLORS.white,
                tabBarActiveTintColor: COLORS.primary,
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={route.name === 'Map' ? 'map-outline' : 'list-outline'} color={color} size={size} />
                ),
            })}
        >
            <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Mapa de Loja' }} />
            <Tab.Screen name="List" component={ListScreen} options={{ title: 'Parqueaderos' }} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="PublicParkings"
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.tertiary },
                    headerTintColor: COLORS.white,
                }}
            >
                <Stack.Screen name="PublicParkings" component={PublicTabs} options={{ headerShown: false }} />
                <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} options={{ title: 'Detalle' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
