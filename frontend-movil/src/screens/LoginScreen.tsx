import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMobileEnvironment } from '../config/environment';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { loginOwner } from '../services/mobileAuthApi';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const { height } = useWindowDimensions();
    const compact = height < 780;
    const passwordInput = useRef<TextInput>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (submitting) return;
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError('Ingresa un correo electrónico válido.');
            return;
        }
        if (!password) {
            setError('Ingresa tu contraseña.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await loginOwner(email, password);
            Alert.alert('Sesión iniciada', 'Tus credenciales de propietario fueron verificadas correctamente.');
            navigation.replace('OwnerDashboard');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'No fue posible iniciar sesión.');
        } finally {
            setSubmitting(false);
        }
    };

    const openWebRegistration = async () => {
        try {
            const webBaseUrl = getMobileEnvironment().webBaseUrl;
            if (!webBaseUrl) {
                Alert.alert('Sitio web no configurado', 'Define EXPO_PUBLIC_WEB_BASE_URL para abrir el registro.');
                return;
            }
            await Linking.openURL(`${webBaseUrl}/register`);
        } catch (linkError) {
            Alert.alert(
                'No se pudo abrir el sitio web',
                linkError instanceof Error ? linkError.message : 'Inténtalo nuevamente en unos segundos.',
            );
        }
    };

    return (
        <ImageBackground source={require('../../assets/fondoL.png')} resizeMode="cover" style={styles.background}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={styles.keyboardArea}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.card}>
                            <View style={[styles.header, compact && styles.headerCompact]}>
                                <MaterialCommunityIcons name="car-outline" size={compact ? 52 : 66} color="#FFFFFF" />
                                <Text style={[styles.title, compact && styles.titleCompact]}>¡Hola, bienvenido!</Text>
                                <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
                                    Ingresa como propietario para gestionar tu{`\n`}parqueadero.
                                </Text>
                            </View>

                            <View style={[styles.content, compact && styles.contentCompact]}>
                                <Text style={styles.labelBlue}>ACCESO DE PROPIETARIO</Text>
                                <Text style={[styles.loginTitle, compact && styles.loginTitleCompact]}>Iniciar sesión</Text>
                                <Text style={[styles.description, compact && styles.descriptionCompact]}>
                                    Usa las mismas credenciales de la página web.
                                </Text>

                                <Text style={styles.label}>Correo electrónico</Text>
                                <View style={styles.input}>
                                    <MaterialIcons name="email" color="#7EAFFF" size={22} />
                                    <TextInput
                                        accessibilityLabel="Correo electrónico"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        keyboardType="email-address"
                                        returnKeyType="next"
                                        style={styles.textInput}
                                        value={email}
                                        onChangeText={setEmail}
                                        onSubmitEditing={() => passwordInput.current?.focus()}
                                    />
                                </View>

                                <Text style={styles.label}>Contraseña</Text>
                                <View style={styles.input}>
                                    <MaterialIcons name="lock" color="#7EAFFF" size={22} />
                                    <TextInput
                                        ref={passwordInput}
                                        accessibilityLabel="Contraseña"
                                        autoComplete="password"
                                        returnKeyType="done"
                                        secureTextEntry={!passwordVisible}
                                        style={styles.textInput}
                                        value={password}
                                        onChangeText={setPassword}
                                        onSubmitEditing={submit}
                                    />
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        hitSlop={10}
                                        onPress={() => setPasswordVisible((visible) => !visible)}
                                    >
                                        <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={22} color="#7EAFFF" />
                                    </TouchableOpacity>
                                </View>

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <TouchableOpacity
                                    accessibilityRole="button"
                                    activeOpacity={0.86}
                                    disabled={submitting}
                                    style={[styles.loginButton, submitting && styles.disabledButton]}
                                    onPress={submit}
                                >
                                    {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Ingresar</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    accessibilityRole="button"
                                    activeOpacity={0.86}
                                    style={styles.backButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.backButtonText}>Volver al inicio</Text>
                                </TouchableOpacity>

                                <TouchableOpacity accessibilityRole="link" onPress={openWebRegistration}>
                                    <Text style={[styles.footer, compact && styles.footerCompact]}>
                                        El registro y la recuperación del proceso de habilitación continúan disponibles en la página web.
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: '#EDF5FF' },
    safeArea: { flex: 1 },
    keyboardArea: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 18 },
    card: {
        overflow: 'hidden', borderRadius: 30, backgroundColor: '#FFFFFF', shadowColor: '#0B1B4F',
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 10,
    },
    header: { alignItems: 'center', backgroundColor: '#2E79F3', paddingHorizontal: 18, paddingVertical: 26 },
    headerCompact: { paddingVertical: 18 },
    title: { marginTop: 8, color: '#FFFFFF', fontSize: 32, fontWeight: '700', textAlign: 'center' },
    titleCompact: { fontSize: 27 },
    subtitle: { marginTop: 8, color: '#F2F7FF', fontSize: 16, lineHeight: 23, textAlign: 'center' },
    subtitleCompact: { fontSize: 14, lineHeight: 20 },
    content: { padding: 26 },
    contentCompact: { paddingHorizontal: 22, paddingVertical: 18 },
    labelBlue: { marginBottom: 9, color: '#2E79F3', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
    loginTitle: { marginBottom: 7, color: '#0B1B4F', fontSize: 37, fontWeight: '700' },
    loginTitleCompact: { fontSize: 31 },
    description: { marginBottom: 20, color: '#8B94A7', fontSize: 15 },
    descriptionCompact: { marginBottom: 13 },
    label: { marginTop: 5, marginBottom: 7, color: '#18264A', fontWeight: '600' },
    input: {
        height: 54, marginBottom: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5EAF5', borderRadius: 15, backgroundColor: '#FFFFFF',
    },
    textInput: { flex: 1, marginLeft: 12, color: '#18264A', fontSize: 16 },
    errorText: { marginTop: -4, marginBottom: 6, color: '#C23838', fontSize: 13, lineHeight: 18 },
    loginButton: {
        height: 55, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 15,
        backgroundColor: '#156CF7',
    },
    disabledButton: { opacity: 0.72 },
    loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    backButton: {
        height: 55, marginTop: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 15,
        backgroundColor: '#EDF3FD',
    },
    backButtonText: { color: '#156CF7', fontSize: 18, fontWeight: '700' },
    footer: { marginTop: 20, color: '#8D96A7', fontSize: 13, lineHeight: 19, textAlign: 'center' },
    footerCompact: { marginTop: 14, fontSize: 12, lineHeight: 17 },
});
