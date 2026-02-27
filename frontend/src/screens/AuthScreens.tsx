import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0A1E', '#1A1232', '#0F0A1E']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={styles.logoCircle}>
                            <LinearGradient colors={['#F97316', '#DC2626']} style={styles.logoGradient}>
                                <Text style={styles.logoEmoji}>🪔</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.appName}>Pandal Hopping</Text>
                        <Text style={styles.tagline}>Discover Durga Puja pandals near you</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardSubtitle}>Sign in to continue your journey</Text>

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
                        />
                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Your password"
                            secureTextEntry={!showPass}
                            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
                            rightIcon={
                                <Ionicons
                                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={COLORS.textMuted}
                                />
                            }
                            onRightIconPress={() => setShowPass(!showPass)}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            size="lg"
                            style={styles.loginBtn}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>New here?</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            title="Create Account"
                            onPress={() => navigation.navigate('Register')}
                            variant="secondary"
                            size="lg"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

export const RegisterScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0A1E', '#1A1232', '#0F0A1E']} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Back button */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.hero}>
                        <View style={styles.logoCircle}>
                            <LinearGradient colors={['#F97316', '#DC2626']} style={styles.logoGradient}>
                                <Text style={styles.logoEmoji}>🪔</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.appName}>Join the Celebration</Text>
                        <Text style={styles.tagline}>Create your account and start exploring</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Create Account</Text>

                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />}
                        />
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
                        />
                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Min. 6 characters"
                            secureTextEntry={!showPass}
                            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
                            rightIcon={
                                <Ionicons
                                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={COLORS.textMuted}
                                />
                            }
                            onRightIconPress={() => setShowPass(!showPass)}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            size="lg"
                            style={styles.loginBtn}
                        />

                        <Button
                            title="Already have an account? Sign In"
                            onPress={() => navigation.goBack()}
                            variant="ghost"
                            size="md"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    backBtn: {
        marginTop: SPACING.xl,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hero: {
        alignItems: 'center',
        marginTop: SPACING.xxl,
        marginBottom: SPACING.xl,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    logoGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoEmoji: {
        fontSize: 42,
    },
    appName: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '900',
        color: COLORS.textPrimary,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    tagline: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    cardSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    loginBtn: {
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.sm,
    },
});
