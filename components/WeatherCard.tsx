import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import * as Location from "expo-location";

import {
    Cloud,
    CloudRain,
    Droplets,
    Sun,
    Wind,
} from "lucide-react-native";

import { GLOBAL_STYLES } from "@/constants/styles";
import { THEME } from "@/constants/theme";

export default function WeatherCard({ onWeather }: any) {
    const [weather, setWeather] = useState<any>(null);

    const loadWeather = useCallback(async () => {
        try {
            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted") return;

            const location =
                await Location.getCurrentPositionAsync({});

            const { latitude, longitude } =
                location.coords;

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
            );

            const data = await response.json();

            setWeather(data.current);
            onWeather?.(data.current);
        } catch (error) {
            console.log(error);
        }
    }, [onWeather]);

    useEffect(() => {
        loadWeather();
    }, [loadWeather]);

    function getWeatherInfo(code: number) {
        if (code < 3)
            return {
                label: "Soleado",
                icon: (
                    <Sun
                        size={28}
                        color={THEME.colors.primary}
                    />
                ),
            };

        if (code < 50)
            return {
                label: "Nublado",
                icon: (
                    <Cloud
                        size={28}
                        color={THEME.colors.primary}
                    />
                ),
            };

        return {
            label: "Lluvioso",
            icon: (
                <CloudRain
                    size={28}
                    color={THEME.colors.primary}
                />
            ),
        };
    }

    if (!weather) {
        return (
            <View style={[GLOBAL_STYLES.card, styles.card]}>
                <ActivityIndicator
                    size="small"
                    color={THEME.colors.primary}
                />

                <Text style={styles.loadingText}>
                    Cargando clima...
                </Text>
            </View>
        );
    }

    const weatherInfo =
        getWeatherInfo(weather.weather_code);

    return (
        <View style={[GLOBAL_STYLES.card, styles.card]}>
            <View style={styles.header}>
                <View style={styles.weatherLeft}>
                    {weatherInfo.icon}

                    <View>
                        <Text style={styles.title}>
                            Clima actual
                        </Text>

                        <Text style={styles.status}>
                            {weatherInfo.label}
                        </Text>
                    </View>
                </View>

                <Text style={styles.temp}>
                    {Math.round(
                        weather.temperature_2m
                    )}°
                </Text>
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Droplets
                        size={18}
                        color={THEME.colors.primary}
                    />

                    <Text style={styles.statLabel}>
                        Humedad
                    </Text>

                    <Text style={styles.statValue}>
                        {weather.relative_humidity_2m}%
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Wind
                        size={18}
                        color={THEME.colors.primary}
                    />

                    <Text style={styles.statLabel}>
                        Viento
                    </Text>

                    <Text style={styles.statValue}>
                        {weather.wind_speed_10m} km/h
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: 0,
        marginBottom: THEME.spacing.lg,
        padding: THEME.spacing.lg,
    },

    loadingText: {
        marginTop: THEME.spacing.sm,
        color: THEME.colors.muted,
        textAlign: "center",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    weatherLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: THEME.colors.text,
    },

    status: {
        marginTop: 4,
        fontSize: 14,
        color: THEME.colors.primary,
    },

    temp: {
        fontSize: 44,
        fontWeight: "700",
        color: THEME.colors.text,
    },

    stats: {
        marginTop: THEME.spacing.lg,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    statItem: {
        flex: 1,
        gap: 4,
    },

    statLabel: {
        fontSize: 13,
        color: THEME.colors.muted,
    },

    statValue: {
        fontSize: 18,
        fontWeight: "600",
        color: THEME.colors.text,
    },
});
