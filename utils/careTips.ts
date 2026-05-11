/**
 * Species-Specific Care Tips Database
 * Contains detailed care instructions for common bonsai species
 */

import { CareTip, SpeciesCareTips } from "../types/bonsai";

const BONSAI_SPECIES_DATABASE: Record<string, SpeciesCareTips> = {
    // ==================== Juniperus ====================
    "juniperus-procumbens": {
        species: "Juniperus procumbens",
        commonName: "Juniper Bonsai",
        wateringFrequency: {
            spring: "Every 2-3 days",
            summer: "Daily or every 2 days (keep moist but not soggy)",
            autumn: "Every 2-3 days",
            winter: "Every 3-4 days (less frequent)",
        },
        sunlight:
            "Full sun (6-8 hours daily). Requires excellent light for optimal growth.",
        temperature: {
            min: 5,
            max: 25,
        },
        humidity: "Moderate humidity. Mist foliage in dry conditions.",
        generalTips: [
            {
                title: "Wire Training",
                description:
                    "Apply wire in spring/summer when growth is active. Check monthly to prevent wire cuts.",
                priority: "high",
            },
            {
                title: "Pruning",
                description:
                    "Prune new growth regularly to maintain shape. Cut just above a bud node.",
                priority: "high",
            },
            {
                title: "Winter Care",
                description:
                    "Place outdoors during winter for cold dormancy period (4-8 weeks). This promotes spring growth.",
                priority: "high",
            },
            {
                title: "Pest Prevention",
                description:
                    "Watch for spider mites and scale insects. Treat with neem oil if infested.",
                priority: "medium",
            },
        ],
        substrateRecommendations: ["pumice", "bark", "akadama"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Summer",
                frequency: "Weekly",
                intensity: "Full strength",
            },
            {
                season: "Autumn",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Winter",
                frequency: "Monthly (optional)",
                intensity: "Quarter strength",
            },
        ],
    },

    // ==================== Ficus ====================
    "ficus-retusa": {
        species: "Ficus retusa",
        commonName: "Indian Laurel Fig",
        wateringFrequency: {
            spring: "Every 2-3 days",
            summer: "Every 1-2 days (keep consistently moist)",
            autumn: "Every 2-3 days",
            winter: "Every 3-4 days",
        },
        sunlight:
            "Bright indirect light (4-6 hours). Avoid direct afternoon sun in summer.",
        temperature: {
            min: 10,
            max: 30,
        },
        humidity:
            "High humidity preferred (60%+). Mist frequently, especially in summer.",
        generalTips: [
            {
                title: "Tropical Species",
                description:
                    "Ficus prefer warm, humid conditions. Protect from cold drafts and temperature fluctuations.",
                priority: "high",
            },
            {
                title: "Leaf Loss Prevention",
                description:
                    "Sudden leaf loss indicates cold stress or inconsistent watering. Maintain stable conditions.",
                priority: "high",
            },
            {
                title: "Aerial Roots",
                description:
                    "Aerial roots can be left to grow for character or trimmed for neatness.",
                priority: "low",
            },
            {
                title: "Repotting",
                description:
                    "Repot every 2-3 years in spring. Ficus are vigorous growers.",
                priority: "medium",
            },
        ],
        substrateRecommendations: ["akadama", "pumice", "bark"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Weekly",
                intensity: "Half strength",
            },
            {
                season: "Summer",
                frequency: "Bi-weekly",
                intensity: "Full strength",
            },
            {
                season: "Autumn",
                frequency: "Weekly",
                intensity: "Half strength",
            },
            {
                season: "Winter",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
        ],
    },

    // ==================== Acer ====================
    "acer-palmatum": {
        species: "Acer palmatum",
        commonName: "Japanese Maple",
        wateringFrequency: {
            spring: "Daily or every 2 days",
            summer: "Daily (keep soil moist, especially in heat)",
            autumn: "Every 2-3 days",
            winter: "Every 3-4 days (dormant period)",
        },
        sunlight:
            "Dappled sunlight (filtered shade in afternoon). Full morning sun ideal.",
        temperature: {
            min: -5,
            max: 25,
        },
        humidity: "Moderate humidity. Mist regularly during growing season.",
        generalTips: [
            {
                title: "Fall Dormancy",
                description:
                    "Japanese Maples are deciduous. Expect leaf loss in autumn. This is normal.",
                priority: "high",
            },
            {
                title: "Sunburn Prevention",
                description:
                    "Afternoon sun can scorch delicate leaves. Provide shade during hottest months.",
                priority: "high",
            },
            {
                title: "Spring Growth",
                description:
                    "Vigorous growth in spring. Prune back hard after leaf emergence to develop ramification.",
                priority: "medium",
            },
            {
                title: "Cold Hardiness",
                description:
                    "Needs winter dormancy. Allow outdoor placement in cold temperatures.",
                priority: "high",
            },
        ],
        substrateRecommendations: ["akadama", "pumice", "bark"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Weekly",
                intensity: "Half strength",
            },
            {
                season: "Summer",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Autumn",
                frequency: "Weekly",
                intensity: "Quarter strength",
            },
            {
                season: "Winter",
                frequency: "None",
                intensity: "None",
            },
        ],
    },

    // ==================== Pinus ====================
    "pinus-parviflora": {
        species: "Pinus parviflora",
        commonName: "Japanese Black Pine",
        wateringFrequency: {
            spring: "Every 2-3 days",
            summer: "Daily (needs consistent moisture)",
            autumn: "Every 2-3 days",
            winter: "Every 4-5 days (less frequent)",
        },
        sunlight:
            "Full sun required (8+ hours daily). Essential for healthy growth.",
        temperature: {
            min: -10,
            max: 30,
        },
        humidity: "Moderate humidity. Avoid excessive misting on foliage.",
        generalTips: [
            {
                title: "Candle Pruning",
                description:
                    "Pinch new candles in spring to develop fine ramification. Key technique for pines.",
                priority: "high",
            },
            {
                title: "Full Sun Essential",
                description:
                    "Pines need maximum light. Insufficient light leads to weak growth.",
                priority: "high",
            },
            {
                title: "Winter Dormancy",
                description:
                    "Needs cold period. Place outdoors in winter for optimal spring growth.",
                priority: "high",
            },
            {
                title: "Needle Yellowing",
                description:
                    "Yellow needles indicate stress (drought, cold, or poor light). Address root cause.",
                priority: "medium",
            },
        ],
        substrateRecommendations: ["pumice", "bark", "akadama"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Summer",
                frequency: "Weekly",
                intensity: "Full strength",
            },
            {
                season: "Autumn",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Winter",
                frequency: "None",
                intensity: "None",
            },
        ],
    },

    // ==================== Ulmus ====================
    "ulmus-parvifolia": {
        species: "Ulmus parvifolia",
        commonName: "Chinese Elm",
        wateringFrequency: {
            spring: "Every 1-2 days",
            summer: "Daily (keep soil consistently moist)",
            autumn: "Every 2-3 days",
            winter: "Every 3-4 days",
        },
        sunlight:
            "Bright indirect light (4-6 hours). Can tolerate some afternoon shade.",
        temperature: {
            min: 5,
            max: 30,
        },
        humidity: "High humidity preferred. Mist regularly.",
        generalTips: [
            {
                title: "Vigorous Grower",
                description:
                    "Chinese Elm grow fast. Prune frequently to maintain shape and develop ramification.",
                priority: "high",
            },
            {
                title: "Leaf Drop",
                description:
                    "Sensitive to cold drafts and watering changes. Sudden leaf loss indicates stress.",
                priority: "medium",
            },
            {
                title: "Indoor Friendly",
                description:
                    "Can be grown indoors in bright locations. Better than most species for indoor culture.",
                priority: "medium",
            },
            {
                title: "Year-Round Growth",
                description:
                    "Grows actively year-round in warm conditions. No true dormancy needed.",
                priority: "low",
            },
        ],
        substrateRecommendations: ["akadama", "pumice", "bark"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Weekly",
                intensity: "Full strength",
            },
            {
                season: "Summer",
                frequency: "Weekly",
                intensity: "Full strength",
            },
            {
                season: "Autumn",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Winter",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
        ],
    },

    // ==================== Zelkova ====================
    "zelkova-serrata": {
        species: "Zelkova serrata",
        commonName: "Japanese Elm",
        wateringFrequency: {
            spring: "Every 2-3 days",
            summer: "Daily or every 2 days",
            autumn: "Every 2-3 days",
            winter: "Every 4-5 days (dormant)",
        },
        sunlight: "Full sun to bright partial shade (6-8 hours). Needs good light.",
        temperature: {
            min: -5,
            max: 25,
        },
        humidity: "Moderate humidity. Mist occasionally.",
        generalTips: [
            {
                title: "Fine Ramification",
                description:
                    "Zelkova develop fine branches easily. Regular pruning encourages ramification.",
                priority: "high",
            },
            {
                title: "Deciduous",
                description:
                    "Loses leaves in winter. This is normal and healthy. Tree needs winter dormancy.",
                priority: "medium",
            },
            {
                title: "Strong Growth",
                description:
                    "Vigorous grower. Prune hard in spring to maintain desired shape.",
                priority: "medium",
            },
            {
                title: "Disease Resistance",
                description:
                    "Generally hardy. Resistant to pests when kept in good health.",
                priority: "low",
            },
        ],
        substrateRecommendations: ["akadama", "pumice", "bark"],
        fertilizationSchedule: [
            {
                season: "Spring",
                frequency: "Bi-weekly",
                intensity: "Full strength",
            },
            {
                season: "Summer",
                frequency: "Weekly",
                intensity: "Full strength",
            },
            {
                season: "Autumn",
                frequency: "Bi-weekly",
                intensity: "Half strength",
            },
            {
                season: "Winter",
                frequency: "None",
                intensity: "None",
            },
        ],
    },
};

/**
 * Get care tips for a specific species
 * @param species - Species name or key
 * @returns Care tips if found, or general tips if not
 */
export function getSpeciesCareTips(species: string): SpeciesCareTips {
    // Try exact match first
    if (BONSAI_SPECIES_DATABASE[species.toLowerCase()]) {
        return BONSAI_SPECIES_DATABASE[species.toLowerCase()];
    }

    // Try partial match (genus or common features)
    const lowerSpecies = species.toLowerCase();
    for (const [key, tips] of Object.entries(BONSAI_SPECIES_DATABASE)) {
        if (
            lowerSpecies.includes(key.split("-")[0]) ||
            key.split("-")[0].includes(lowerSpecies.split(/[\s-]/)[0])
        ) {
            return tips;
        }
    }

    // Return generic care tips if species not found
    return getGenericCareTips(species);
}

/**
 * Get generic care tips for unknown species
 */
function getGenericCareTips(species: string): SpeciesCareTips {
    return {
        species,
        commonName: "Bonsai",
        wateringFrequency: {
            spring: "Every 2-3 days",
            summer: "Every 1-2 days",
            autumn: "Every 2-3 days",
            winter: "Every 3-5 days",
        },
        sunlight: "Bright light required (4-8 hours). Adjust based on species.",
        temperature: {
            min: 5,
            max: 30,
        },
        humidity: "Moderate to high humidity. Mist if air is dry.",
        generalTips: [
            {
                title: "Basic Care",
                description:
                    "Monitor soil moisture regularly. Water thoroughly but allow slight drying between waterings.",
                priority: "high",
            },
            {
                title: "Light & Position",
                description:
                    "Most bonsai prefer bright, indirect light. Avoid dark corners.",
                priority: "high",
            },
            {
                title: "Regular Maintenance",
                description:
                    "Prune new growth regularly to maintain shape and encourage ramification.",
                priority: "medium",
            },
            {
                title: "Research Your Species",
                description:
                    "Different species have different needs. Research your specific bonsai type.",
                priority: "medium",
            },
        ],
        substrateRecommendations: ["akadama", "pumice", "bark"],
        fertilizationSchedule: [
            {
                season: "Growing Season",
                frequency: "Weekly to Bi-weekly",
                intensity: "Half to Full strength",
            },
            {
                season: "Dormant Season",
                frequency: "Bi-weekly to Monthly",
                intensity: "Quarter to Half strength",
            },
        ],
    };
}

/**
 * Get all available species in the database
 */
export function getAllAvailableSpecies(): string[] {
    return Object.keys(BONSAI_SPECIES_DATABASE).map((key) => {
        const tips = BONSAI_SPECIES_DATABASE[key];
        return `${tips.species} - ${tips.commonName}`;
    });
}

/**
 * Get seasonal care tips for the current season
 */
export function getSeasonalCareTips(species: string, season: string): CareTip[] {
    const tips = getSpeciesCareTips(species);
    return tips.generalTips.filter(
        (tip) => !tip.season || tip.season.toLowerCase() === season.toLowerCase()
    );
}
