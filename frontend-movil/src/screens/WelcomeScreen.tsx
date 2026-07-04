import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { COLORS } from '../constants/theme';

export default function WelcomeScreen({ navigation }: any) {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleAdminLogin = () => {
        if (username.trim() !== '' && password.trim() !== '') {
            navigation.navigate('OwnerDashboard');
        } else {
            Alert.alert('Error', 'Por favor ingresa un usuario y contraseña.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/logoM.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.subtitle}>Gestión de Parqueaderos - Loja</Text>

            {!isAdminMode ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.primary }]}
                        onPress={() => setIsAdminMode(true)}
                    >
                        <Text style={styles.buttonText}>Ingresar (Administración)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.secondary }]}
                        onPress={() => navigation.navigate('DriverHome')}
                    >
                        <Text style={styles.buttonText}>Buscar Parqueaderos (Cliente)</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.loginForm}>
                    <Text style={styles.formTitle}>Acceso de Propietario</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Usuario Administrativo"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleAdminLogin}>
                        <Text style={styles.buttonText}>Entrar al Panel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsAdminMode(false)}>
                        <Text style={styles.backText}>← Volver</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 20 },
    logo: { width: 180, height: 180, marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 40, fontWeight: '500' },
    buttonContainer: { width: '100%', gap: 15 },
    button: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', elevation: 2 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    loginForm: { width: '100%', backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 3 },
    formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    input: { width: '100%', borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#FAFAFA' },
    loginButton: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 15 },
    backText: { color: COLORS.secondary, textAlign: 'center', fontWeight: '500' }
});