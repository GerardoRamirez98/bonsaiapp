import * as Location from "expo-location";

export async function getWeather() {
    const { status } =
        await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
        throw new Error("Permiso denegado");
    }

    const location =
        await Location.getCurrentPositionAsync({});

    const { latitude, longitude } = location.coords;

    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );

    const data = await res.json();

    return data.current.temperature_2m;
}