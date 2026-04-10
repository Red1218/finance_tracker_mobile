import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg: '#0a0a0a', card: '#141414', border: '#292929',
    primary: '#ff3d3d', text: '#fafafa', muted: '#999999', input: '#1a1a1a',
};

export default function AuthScreen() {
    const { signIn, signUp, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    if (user) return <Redirect href="/" />;

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        setLoading(true);
        let error;
        if (isSignUp) {
            const result = await signUp(email, password);
            error = result.error;
            if (!error) Alert.alert('Success', 'Check your email to verify your account!');
        } else {
            const result = await signIn(email, password);
            error = result.error;
        }
        if (error) Alert.alert('Error', (error as any).message || 'An error occurred');
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
                <View style={styles.headerBox}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>₹</Text>
                    </View>
                    <Text style={styles.appName}>Finance Tracker</Text>
                    <Text style={styles.tagline}>
                        {isSignUp ? 'Create your account' : 'Sign in to continue'}
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={COLORS.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={loading}>
                        <Text style={styles.primaryBtnText}>
                            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsSignUp(!isSignUp)}>
                        <Text style={styles.secondaryBtnText}>
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    headerBox: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 64, height: 64, backgroundColor: COLORS.primary, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    logoText: { fontSize: 28, fontWeight: '700', color: '#fff' },
    appName: { fontSize: 28, fontWeight: '700', color: COLORS.text },
    tagline: { fontSize: 14, color: COLORS.muted, marginTop: 6 },
    form: {},
    label: { fontSize: 13, color: COLORS.muted, marginBottom: 6, fontWeight: '500' },
    input: {
        backgroundColor: COLORS.input,
        color: COLORS.text,
        fontSize: 15,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    secondaryBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
    secondaryBtnText: { color: COLORS.primary, fontSize: 14 },
});
