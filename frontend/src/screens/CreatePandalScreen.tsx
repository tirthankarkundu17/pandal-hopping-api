import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pandalApi, CreatePandalInput } from '../api/pandals';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ScreenHeader } from '../components/common';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export const CreatePandalScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !area.trim()) {
            Alert.alert('Missing Fields', 'Name and Area are required fields.');
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (latitude && longitude && (isNaN(lat) || isNaN(lng))) {
            Alert.alert('Invalid Coordinates', 'Please enter valid numeric latitude and longitude values.');
            return;
        }

        const payload: CreatePandalInput = {
            name: name.trim(),
            area: area.trim(),
            description: description.trim() || undefined,
            theme: theme.trim() || undefined,
            location: {
                type: 'Point',
                coordinates: [
                    longitude ? lng : 88.3697,
                    latitude ? lat : 22.5797,
                ],
            },
            images: imageUrl.trim() ? [imageUrl.trim()] : [],
        };

        setLoading(true);
        try {
            await pandalApi.createPandal(payload);
            Alert.alert(
                '🎉 Submitted!',
                'Your pandal has been submitted for review. It will appear once approved.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Failed to submit pandal.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Submit Pandal"
                subtitle="Share a pandal with the community"
                rightElement={
                    <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <SectionTitle title="Basic Info" icon="information-circle-outline" />

                    <Input
                        label="Pandal Name *"
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Kumartuli Park"
                        leftIcon={<Ionicons name="business-outline" size={18} color={COLORS.textMuted} />}
                    />
                    <Input
                        label="Area / Locality *"
                        value={area}
                        onChangeText={setArea}
                        placeholder="e.g. Shyambazar"
                        leftIcon={<Ionicons name="location-outline" size={18} color={COLORS.textMuted} />}
                    />
                    <Input
                        label="Theme"
                        value={theme}
                        onChangeText={setTheme}
                        placeholder="e.g. Mahishasura Mardini"
                        leftIcon={<Ionicons name="color-palette-outline" size={18} color={COLORS.textMuted} />}
                    />
                    <Input
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell people about this pandal..."
                        multiline
                        numberOfLines={3}
                        style={{ height: 85, textAlignVertical: 'top', paddingTop: 12 }}
                        leftIcon={<Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />}
                    />

                    <SectionTitle title="Media" icon="image-outline" />
                    <Input
                        label="Image URL"
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        placeholder="https://example.com/image.jpg"
                        keyboardType="url"
                        autoCapitalize="none"
                        leftIcon={<Ionicons name="link-outline" size={18} color={COLORS.textMuted} />}
                    />

                    <SectionTitle title="Location (Optional)" icon="map-outline" />
                    <View style={styles.coordRow}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Latitude"
                                value={latitude}
                                onChangeText={setLatitude}
                                placeholder="22.5797"
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.coordSpacer} />
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Longitude"
                                value={longitude}
                                onChangeText={setLongitude}
                                placeholder="88.3697"
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.locationHint}>
                        <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.hintText}>
                            Defaults to Kolkata if no coordinates are provided.
                        </Text>
                    </View>

                    <Button
                        title="Submit Pandal"
                        onPress={handleSubmit}
                        loading={loading}
                        size="lg"
                        style={styles.submitBtn}
                        icon={<Ionicons name="send-outline" size={18} color="#FFF" />}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const SectionTitle = ({ title, icon }: { title: string; icon: string }) => (
    <View style={sectionStyles.container}>
        <Ionicons name={icon as any} size={16} color={COLORS.primary} />
        <Text style={sectionStyles.text}>{title}</Text>
    </View>
);

const sectionStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    text: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    form: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    coordRow: {
        flexDirection: 'row',
    },
    coordSpacer: {
        width: SPACING.md,
    },
    locationHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: -SPACING.sm,
        marginBottom: SPACING.lg,
    },
    hintText: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
    },
    submitBtn: {
        marginTop: SPACING.md,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
