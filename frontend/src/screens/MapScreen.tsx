import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import dataService from '../services';
import { Pandal } from '../api/pandals';

export function MapScreen() {
    const [pandals, setPandals] = useState<Pandal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [initialRegion, setInitialRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
    const mapRef = React.useRef<MapView>(null);

    const loadPandals = useCallback(async (loc?: Location.LocationObject) => {
        try {
            setLoading(true);
            const params = loc ? {
                lng: loc.coords.longitude,
                lat: loc.coords.latitude,
                radius: 5000
            } : undefined;
            const data = await dataService.getPandals(params);
            setPandals(data);
        } catch (error) {
            console.error('Error fetching map pandals:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setInitialRegion({
                        latitude: 22.5726,
                        longitude: 88.3639,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                    loadPandals();
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({});
                setCurrentLocation(loc);
                setInitialRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
                loadPandals(loc);
            } catch (error) {
                console.error('Error getting location', error);
                setInitialRegion({
                    latitude: 22.5726,
                    longitude: 88.3639,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
                loadPandals();
            }
        })();
    }, [loadPandals]);

    const goToMyLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const loc = await Location.getCurrentPositionAsync({});
            setCurrentLocation(loc);
            mapRef.current?.animateToRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        } catch (error) {
            console.error('Error getting location', error);
        }
    }, []);

    return (
        <View style={styles.container}>
            {initialRegion ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                >
                    {currentLocation && (
                        <Marker
                            coordinate={{
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            }}
                            title="You are here"
                            zIndex={999}
                        >
                            <View style={styles.currentLocationMarker}>
                                <View style={styles.currentLocationDot} />
                            </View>
                        </Marker>
                    )}
                    {pandals.map((p) => {
                        const coords = p.location?.coordinates;
                        if (!coords || coords.length !== 2) return null;

                        return (
                            <Marker
                                key={p.id}
                                coordinate={{
                                    latitude: coords[1], // GeoJSON is [lng, lat]
                                    longitude: coords[0]
                                }}
                                onPress={() => setSelectedPandal(p)}
                            >
                                <View style={styles.pandalPin}>
                                    <View style={styles.pandalIconContainer}>
                                        <MaterialCommunityIcons name="temple-hindu" size={18} color="#FFF" />
                                    </View>
                                </View>
                                <Callout tooltip>
                                    <View style={styles.calloutContainer}>
                                        <Text style={styles.calloutTitle}>{p.name}</Text>
                                        <Text style={styles.calloutSubtitle}>{p.area}</Text>
                                        <Text style={styles.calloutHint}>Tap below for details</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        );
                    })}
                </MapView>
            ) : null}

            <TouchableOpacity
                style={styles.myLocationButton}
                onPress={goToMyLocation}
                activeOpacity={0.8}
            >
                <Ionicons name="navigate" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}

            {/* Selected Pandal Card Popup */}
            {selectedPandal && (
                <View style={styles.carouselContainer}>
                    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                        {selectedPandal.images?.[0] ? (
                            <Image source={{ uri: selectedPandal.images[0] }} style={styles.cardImage} />
                        ) : (
                            <View style={[styles.cardImage, styles.placeholderImage]}>
                                <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
                            </View>
                        )}
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{selectedPandal.name}</Text>
                            <Text style={styles.cardSubtitle} numberOfLines={1}>{selectedPandal.area}</Text>
                            {selectedPandal.description ? (
                                <Text style={styles.cardDescription} numberOfLines={2}>{selectedPandal.description}</Text>
                            ) : null}
                            <TouchableOpacity
                                style={styles.directionBtn}
                                onPress={() => {
                                    const coords = selectedPandal.location?.coordinates;
                                    if (coords && coords.length === 2) {
                                        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`);
                                    }
                                }}
                            >
                                <Ionicons name="navigate" size={14} color="#FFF" />
                                <Text style={styles.directionBtnText}>Get Direction</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setSelectedPandal(null)}
                        >
                            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 4, 28, 0.4)',
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 120,
        right: SPACING.md,
        backgroundColor: COLORS.bgCard,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 10,
    },
    pandalPin: {
        width: 38,
        height: 38,
        backgroundColor: COLORS.primary,
        borderRadius: 19,
        borderBottomRightRadius: 0,
        transform: [{ rotate: '-45deg' }],
        borderWidth: 2,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    pandalIconContainer: {
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 2, // visual compensation for tear-drop rotation centering
        marginTop: 2,
    },
    calloutContainer: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        minWidth: 120,
        borderColor: COLORS.border,
        borderWidth: 1,
    },
    calloutTitle: {
        fontSize: FONTS.sizes.sm,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    calloutSubtitle: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
    },
    calloutHint: {
        fontSize: 9,
        color: COLORS.primary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    carouselContainer: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: RADIUS.md,
    },
    placeholderImage: {
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    cardTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
    },
    cardDescription: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
        lineHeight: 16,
    },
    directionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
        marginTop: SPACING.sm,
        alignSelf: 'flex-start',
    },
    directionBtnText: {
        color: '#FFF',
        fontSize: FONTS.sizes.xs,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    closeBtn: {
        padding: SPACING.sm,
    },
    currentLocationMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
        borderWidth: 2,
        borderColor: '#fff',
    }
});
