export function getSeason() {
    const month = new Date().getMonth() + 1;

    if ([12, 1, 2].includes(month))
        return "Invierno";

    if ([3, 4, 5].includes(month))
        return "Primavera";

    if ([6, 7, 8].includes(month))
        return "Verano";

    return "Otoño";
}