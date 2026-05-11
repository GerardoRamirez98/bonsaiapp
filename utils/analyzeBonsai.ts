export function analyzeBonsai(
    photos: string[]
) {
    const count =
        photos.length;

    if (count < 4) {
        return {
            score: 0,
            style:
                "Escaneo incompleto",
            recommendation:
                "Toma fotos desde los 4 lados.",
        };
    }

    const styles = [
        "Moyogi",
        "Chokkan",
        "Shakan",
        "Fukinagashi",
        "Bunjin",
    ];

    const detected =
        styles[
        Math.floor(
            Math.random() *
            styles.length
        )
        ];

    const score =
        Math.floor(
            Math.random() * 20
        ) + 80;

    let recommendation =
        "";

    if (score < 85) {
        recommendation =
            "Reduce densidad interior y realiza pinzado ligero.";
    } else if (score < 92) {
        recommendation =
            "Buen desarrollo. Mejora compactación del follaje.";
    } else {
        recommendation =
            "Excelente estructura. Mantén rutina actual.";
    }

    return {
        score,
        style: detected,
        recommendation,
    };
}