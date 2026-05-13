import { SpeciesDetectionResult } from "../types/bonsai";

/**
 * Plant.id API Configuration
 * Get your API key from https://plant.id
 * Set as environment variable: EXPO_PUBLIC_PLANT_ID_API_KEY
 */
const PLANT_ID_API_KEY = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY || null;
const PLANT_ID_API_URL =
    "https://api.plant.id/v3/identification?details=common_names,url,wiki_description";

/**
 * Detect bonsai species from an image
 * Uses Plant.id API v3 for species identification
 *
 * @param imageBase64 - Base64 encoded image string (without data:image/jpeg;base64, prefix)
 * @returns Species detection result with name and confidence score
 *
 * @example
 * const result = await detectBonsaiSpecies(imageBase64);
 * console.log(result.species); // "Juniperus procumbens"
 * console.log(result.confidence); // 0.89
 */
export async function detectBonsaiSpecies(
    imageBase64: string
): Promise<SpeciesDetectionResult> {
    // Check if API key is configured
    if (!PLANT_ID_API_KEY) {
        console.warn(
            "Plant.id API key not configured. Set EXPO_PUBLIC_PLANT_ID_API_KEY environment variable."
        );
        return {
            species: "Desconocido",
            commonName: "Unknown Species",
            confidence: 0,
            description:
                "API key not configured. Please set EXPO_PUBLIC_PLANT_ID_API_KEY.",
        };
    }

    // Validate input
    if (!imageBase64 || imageBase64.length === 0) {
        console.error("Invalid image data provided for species detection");
        return {
            species: "Desconocido",
            commonName: "Unknown Species",
            confidence: 0,
            description: "Invalid image data",
        };
    }

    try {
        console.log("Detecting species from image...");

        const response = await fetch(PLANT_ID_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": PLANT_ID_API_KEY,
            },
            body: JSON.stringify({
                images: [imageBase64],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(
                `Plant.id API error: ${response.status} ${response.statusText}`,
                errorBody
            );

            // Handle specific error codes
            if (response.status === 401) {
                return {
                    species: "Desconocido",
                    commonName: "Authentication Error",
                    confidence: 0,
                    description: "Invalid or expired API key",
                };
            } else if (response.status === 429) {
                return {
                    species: "Desconocido",
                    commonName: "Rate Limited",
                    confidence: 0,
                    description: "Too many requests. Please try again later.",
                };
            }

            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the first suggestion (highest confidence)
        const suggestion = data?.result?.classification?.suggestions?.[0];

        if (!suggestion) {
            console.warn("No species suggestions found in API response");
            return {
                species: "Desconocido",
                commonName: "No match found",
                confidence: 0,
                description:
                    "The API could not identify this image. Try a clearer photo.",
            };
        }

        // Extract information
        const species = suggestion?.name ?? "Desconocido";
        const commonName =
            suggestion?.details?.common_names?.[0] ??
            suggestion?.common_names?.[0] ??
            suggestion?.name ??
            "Unknown";
        const confidence = suggestion?.probability ?? 0;
        const description =
            suggestion?.details?.wiki_description?.value ??
            suggestion?.wiki_description?.value ??
            undefined;
        const imageUrl =
            suggestion?.details?.url ??
            suggestion?.image_url ??
            suggestion?.url ??
            undefined;

        console.log(
            `Species detected: ${species} (${(confidence * 100).toFixed(1)}% confidence)`
        );

        return {
            species,
            commonName,
            confidence,
            description,
            imageUrl,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`Error detecting species: ${errorMessage}`);

        return {
            species: "Desconocido",
            commonName: "Detection Error",
            confidence: 0,
            description: `Failed to detect species: ${errorMessage}`,
        };
    }
}

/**
 * Extract base64 from a URI (remove data:image/jpeg;base64, prefix)
 * @param imageUri - Full data URI or base64 string
 * @returns Clean base64 string
 */
export function extractBase64FromUri(imageUri: string): string {
    if (imageUri.includes(";base64,")) {
        return imageUri.split(";base64,")[1];
    }
    return imageUri;
}

/**
 * Validate if an image string is suitable for API submission
 * @param imageBase64 - Base64 string to validate
 * @returns true if valid, false otherwise
 */
export function isValidImageBase64(imageBase64: string): boolean {
    // Check if string is not empty and reasonable length (photos are usually > 5KB base64)
    if (!imageBase64) {
        return false;
    }

    if (imageBase64.length <= 1000) {
        return false;
    }

    return /^[A-Za-z0-9+/=]+$/.test(imageBase64);
}
