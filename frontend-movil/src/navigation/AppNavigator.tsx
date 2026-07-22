import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import LoginScreen from '../screens/LoginScreen';
import ListScreen from '../screens/ListScreen';
import MapScreen from '../screens/MapScreen';
import OwnerConfigurationScreen from '../screens/OwnerConfigurationScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import OwnerInfoScreen from '../screens/OwnerInfoScreen';
import OwnerSpacesScreen from '../screens/OwnerSpacesScreen';
import ParkingDetailScreen from '../screens/ParkingDetailScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    OwnerDashboard: undefined;
    PublicParkings: undefined;
    ParkingDetail: { parkingId: number };
};

export type PublicTabsParamList = {
    Map: undefined;
    List: undefined;
};

export type OwnerTabsParamList = {
    Dashboard: undefined;
    Information: undefined;
    Configuration: undefined;
    Spaces: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<PublicTabsParamList>();
const OwnerTab = createBottomTabNavigator<OwnerTabsParamList>();

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={8}
            style={styles.backButton}
            onPress={onPress}
        >
            <Ionicons name="chevron-back" color={COLORS.white} size={24} />
        </TouchableOpacity>
    );
}

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
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={({ navigation }) => ({
                    title: 'Mapa de Loja',
                    headerLeft: () => (
                        <BackButton label="Inicio" onPress={() => navigation.getParent()?.goBack()} />
                    ),
                })}
            />
            <Tab.Screen
                name="List"
                component={ListScreen}
                options={({ navigation }) => ({
                    title: 'Parqueaderos',
                    headerLeft: () => (
                        <BackButton label="Inicio" onPress={() => navigation.getParent()?.goBack()} />
                    ),
                })}
            />
        </Tab.Navigator>
    );
}

function OwnerTabs() {
    const icons: Record<keyof OwnerTabsParamList, React.ComponentProps<typeof Ionicons>['name']> = {
        Dashboard: 'grid-outline',
        Information: 'business-outline',
        Configuration: 'settings-outline',
        Spaces: 'car-outline',
    };
    return (
        <OwnerTab.Navigator
            screenOptions={({ route }) => ({
                headerShown: route.name !== 'Dashboard',
                headerStyle: { backgroundColor: '#2E79F3' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '800' },
                tabBarActiveTintColor: '#2E79F3',
                tabBarInactiveTintColor: '#7D8799',
                tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
                tabBarStyle: { minHeight: 64, paddingTop: 6, paddingBottom: 7 },
                tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
            })}
        >
            <OwnerTab.Screen name="Dashboard" component={OwnerDashboardScreen} options={{ title: 'Dashboard' }} />
            <OwnerTab.Screen name="Information" component={OwnerInfoScreen} options={{ title: 'Información' }} />
            <OwnerTab.Screen name="Configuration" component={OwnerConfigurationScreen} options={{ title: 'Configuración' }} />
            <OwnerTab.Screen name="Spaces" component={OwnerSpacesScreen} options={{ title: 'Espacios' }} />
        </OwnerTab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.tertiary },
                    headerTintColor: COLORS.white,
                }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OwnerDashboard" component={OwnerTabs} options={{ headerShown: false }} />
                <Stack.Screen name="PublicParkings" component={PublicTabs} options={{ headerShown: false }} />
                <Stack.Screen
                    name="ParkingDetail"
                    component={ParkingDetailScreen}
                    options={({ navigation }) => ({
                        title: 'Detalle',
                        headerLeft: () => <BackButton label="Regresar" onPress={() => navigation.goBack()} />,
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
});
