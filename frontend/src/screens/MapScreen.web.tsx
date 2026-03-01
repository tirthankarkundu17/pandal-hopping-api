import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import dataService from '../services';
import { Pandal } from '../api/pandals';

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

    const loadPandals = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dataService.getPandals();
            setPandals(data);
        } catch (error) {
            console.error('Error fetching map pandals:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPandals();
    }, [loadPandals]);

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <MapContainer
                    center={[22.5726, 88.3639]}
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {pandals.map((p) => {
                        const coords = p.location?.coordinates;
                        if (!coords || coords.length !== 2) return null;

                        return (
                            <LeafletMarker
                                key={p.id}
                                position={[coords[1], coords[0]]} // GeoJSON is [lng, lat], Leaflet is [lat, lng]
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
            </View>

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
    closeBtn: {
        padding: SPACING.sm,
    }
});
