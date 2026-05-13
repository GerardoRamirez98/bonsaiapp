import * as Location from "expo-location";

export type WeatherSnapshot = {
  temperature: number;
  humidity: number;
  rain: number;
  rainProbability: number;
  uvIndex?: number;
  maxTemperature?: number;
  minTemperature?: number;
  windSpeed?: number;
  weatherCode?: number;
};

export async function getWeather(): Promise<WeatherSnapshot> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permiso de ubicación denegado.");
  }

  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max",
    forecast_days: "1",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo consultar el clima.");
  }

  const data = await response.json();

  return {
    temperature: data.current?.temperature_2m ?? 0,
    humidity: data.current?.relative_humidity_2m ?? 0,
    rain: data.current?.rain ?? 0,
    rainProbability: data.daily?.precipitation_probability_max?.[0] ?? 0,
    uvIndex: data.daily?.uv_index_max?.[0],
    maxTemperature: data.daily?.temperature_2m_max?.[0],
    minTemperature: data.daily?.temperature_2m_min?.[0],
    windSpeed: data.current?.wind_speed_10m,
    weatherCode: data.current?.weather_code,
  };
}
