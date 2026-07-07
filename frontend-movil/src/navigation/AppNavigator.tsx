import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Pantallas
import WelcomeScreen from '../screens/WelcomeScreen';
import ListScreen from '../screens/ListScreen';
import MapScreen from '../screens/MapScreen';
import OwnerDashboard from '../screens/OwnerDashboard';
import ParkingInfoScreen from '../screens/ParkingInfoScreen';
import ManageSpacesScreen from '../screens/ManageSpacesScreen';

import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Sub-Dashboard para los Conductores (Mapa y Lista juntos)
function DriverTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                headerStyle: { backgroundColor: COLORS.tertiary },
                headerTintColor: '#FFF',
            }}
        >
            <Tab.Screen
                name="Mapa"
                component={MapScreen}
                options={{ title: '📍 Mapa Loja' }}
            />
            <Tab.Screen
                name="Lista"
                component={ListScreen}
                options={{ title: '📋 Lista de Parqueaderos' }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.primary },
                    headerTintColor: '#FFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="DriverHome"
                    component={DriverTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="OwnerDashboard"
                    component={OwnerDashboard}
                    options={{ title: 'Panel de Control' }}
                />
                <Stack.Screen
                    name="ParkingInfo"
                    component={ParkingInfoScreen}
                    options={{ title: 'Información General' }}
                />
                <Stack.Screen
                    name="ManageSpaces"
                    component={ManageSpacesScreen}
                    options={{ title: 'Gestión de Espacios' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}