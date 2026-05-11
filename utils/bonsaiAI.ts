export function getAISuggestion({
    temp,
    humidity,
    wind,
    daysSinceWater,
    daily,
    season,
}: {
    temp: number;
    humidity: number;
    wind: number;
    daysSinceWater: number;
    daily: number;
    season: string;
}) {
    if (
        season === "Verano" &&
        daysSinceWater >= 2
    ) {
        return "Verano activo. Revisa sustrato con frecuencia.";
    }

    if (
        season === "Invierno" &&
        daily > 1
    ) {
        return "Invierno detectado. Evita exceso de riego.";
    }

    if (
        season === "Primavera"
    ) {
        return "Primavera: etapa ideal para crecimiento y abonado.";
    }

    if (
        season === "Otoño"
    ) {
        return "Otoño: reduce fertilización gradualmente.";
    }

    if (
        humidity < 35
    ) {
        return "Ambiente seco. Vigila evaporación.";
    }

    if (
        wind > 25
    ) {
        return "Viento fuerte. Protege ramas jóvenes.";
    }

    if (
        temp > 30
    ) {
        return "Temperatura alta. Proporciona sombra parcial.";
    }

    return "Condiciones saludables.";
}