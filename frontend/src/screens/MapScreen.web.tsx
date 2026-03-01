import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import dataService from '../services';
import { Pandal } from '../api/pandals';
import * as Location from 'expo-location';

// Web specific imports
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not loading in React correctly
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Ensure Leaflet fetches assets safely if Metro refuses to require them
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function MapScreen() {
    const [pandals, setPandals] = useState<Pandal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const hasInitLocation = React.useRef(false);

    const loadPandals = useCallback(async (loc?: Location.LocationObject) => {
        try {
            setLoading(true);
            const params = loc ? {
                lng: loc.coords.longitude,
                lat: loc.coords.latitude,
                radius: 500000000
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
            if (hasInitLocation.current) return;
            hasInitLocation.current = true;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setInitialCenter([22.5726, 88.3639]);
                    loadPandals();
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({});
                setCurrentLocation(loc);
                setInitialCenter([loc.coords.latitude, loc.coords.longitude]);
                loadPandals(loc);
            } catch (error) {
                console.error('Error getting location', error);
                setInitialCenter([22.5726, 88.3639]);
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
            if (mapInstance) {
                mapInstance.flyTo([loc.coords.latitude, loc.coords.longitude], 13, { animate: true });
            }
        } catch (error) {
            console.error('Error getting location', error);
        }
    }, [mapInstance]);

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                {initialCenter ? (
                    <MapContainer
                        ref={setMapInstance}
                        center={initialCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {currentLocation && (
                            <LeafletMarker
                                position={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
                                icon={L.divIcon({
                                    className: 'custom-location-dot',
                                    html: `<div style="width: 14px; height: 14px; background: #007AFF; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
                                    iconSize: [18, 18],
                                    iconAnchor: [9, 9]
                                })}
                            >
                                <Popup>You are here</Popup>
                            </LeafletMarker>
                        )}

                        {pandals.map((p) => {
                            const coords = p.location?.coordinates;
                            if (!coords || coords.length !== 2) return null;

                            return (
                                <LeafletMarker
                                    key={p.id}
                                    position={[coords[1], coords[0]]} // GeoJSON is [lng, lat], Leaflet is [lat, lng]
                                    icon={L.divIcon({
                                        className: 'custom-pandal-marker',
                                        html: `<div style="background-color: ${COLORS.primary}; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; margin-left: 2px; margin-top: 2px;"><svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24"><path d="M20 11v2h-2L15 3V1h-2v2h-2V1H9v2H7L3.8 13H2v2h2v8h5v-5h6v5h5v-8h2zm-10.5 0L12 6.47 14.5 11h-5z" fill="white"/></svg></div></div>`,
                                        iconSize: [38, 38],
                                        iconAnchor: [19, 38]
                                    })}
                                    eventHandlers={{
                                        click: () => setSelectedPandal(p),
                                    }}
                                >
                                    <Popup>
                                        <View>
                                            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{p.name}</Text>
                                            <Text style={{ fontSize: 12, color: '#666' }}>{p.area}</Text>
                                        </View>
                                    </Popup>
                                </LeafletMarker>
                            );
                        })}
                    </MapContainer>
                ) : null}
            </View>

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

            {/* Selected Pandal Card Popup (overlaying map) */}
            {selectedPandal && (
                <View style={[styles.carouselContainer, { zIndex: 1000 }]} pointerEvents="box-none">
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
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 4, 28, 0.4)',
        zIndex: 2000,
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
        maxWidth: 400,
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
        zIndex: 500, // Important on web to sit above leaflet map layer
    }
});
