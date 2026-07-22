import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
    const { height } = useWindowDimensions();
    const compact = height < 740;

    return (
        <ImageBackground
            source={require('../../assets/fondo.png')}
            style={styles.background}
            resizeMode="cover"
            accessibilityLabel="Ilustración de ParkingPaTi para encontrar parqueaderos"
        >
            <StatusBar style="dark" />
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={[styles.brandSpace, compact && styles.brandSpaceCompact]}>
                    <Text style={[styles.slogan, compact && styles.sloganCompact]}>
                        Tu espacio, cuando{`\n`}y donde lo necesitas.
                    </Text>
                </View>

                <View style={styles.illustrationSpace} pointerEvents="none" />

                <View style={[styles.actions, compact && styles.actionsCompact]}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Ingresar a ParkingPaTi"
                        activeOpacity={0.86}
                        style={[styles.button, styles.primaryButton, compact && styles.buttonCompact]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <MaterialIcons name="person" size={28} color="#FFFFFF" />
                        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>Ingresar</Text>
                        <MaterialIcons name="arrow-forward-ios" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Buscar parqueaderos cercanos"
                        activeOpacity={0.86}
                        style={[styles.button, styles.secondaryButton, compact && styles.buttonCompact]}
                        onPress={() => navigation.navigate('PublicParkings')}
                    >
                        <FontAwesome5 name="map-marker-alt" size={24} color="#FFFFFF" />
                        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
                            Buscar parqueaderos{`\n`}cercanos
                        </Text>
                        <MaterialIcons name="arrow-forward-ios" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.footer, compact && styles.footerCompact]}>
                    ¡Estacionar nunca fue tan fácil!
                </Text>

                <View style={styles.pagination} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#EDF5FF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 28,
    },
    brandSpace: {
        flexBasis: '31%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    brandSpaceCompact: {
        flexBasis: '29%',
    },
    slogan: {
        color: '#243A63',
        fontSize: 19,
        fontWeight: '600',
        lineHeight: 27,
        textAlign: 'center',
        textShadowColor: 'rgba(255,255,255,0.95)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },
    sloganCompact: {
        fontSize: 17,
        lineHeight: 23,
    },
    illustrationSpace: {
        flex: 1,
        minHeight: 70,
    },
    actions: {
        gap: 16,
        marginBottom: 22,
    },
    actionsCompact: {
        gap: 12,
        marginBottom: 14,
    },
    button: {
        minHeight: 76,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        shadowColor: '#0D47A1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.24,
        shadowRadius: 9,
        elevation: 6,
    },
    buttonCompact: {
        minHeight: 66,
        borderRadius: 19,
        paddingHorizontal: 20,
    },
    primaryButton: {
        backgroundColor: '#1565F9',
    },
    secondaryButton: {
        backgroundColor: '#56A8FF',
    },
    buttonText: {
        flex: 1,
        marginLeft: 18,
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '700',
        lineHeight: 27,
    },
    buttonTextCompact: {
        fontSize: 18,
        lineHeight: 23,
    },
    footer: {
        marginBottom: 17,
        color: '#2F74F2',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    footerCompact: {
        marginBottom: 12,
        fontSize: 17,
    },
    pagination: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dot: {
        width: 11,
        height: 11,
        marginHorizontal: 5,
        borderRadius: 6,
        backgroundColor: '#B9D5FF',
    },
    activeDot: {
        width: 34,
        backgroundColor: '#2F74F2',
    },
});
