/**
 * Centralized Bonsai Type Definitions
 */

// ==================== Events ====================

export type WateringEventType =
  | "water"
  | "fertilizer"
  | "prune"
  | "repot"
  | "wire";

export interface WateringEvent {
  date: string;
  type: WateringEventType;
  intensity?: number;
  notes?: string;
  time?: string;
}

// ==================== Substrato ====================

export type SubstratoType =
  | "akadama"
  | "pumice"
  | "bark"
  | "lava"
  | "sand"
  | "peat"
  | "mixed"
  | "unknown";

export interface Substrato {
  type: SubstratoType;
  percentage: number; // Percentage of total substrate
  lastChanged?: string; // ISO date
}

// ==================== Individual Bonsai ====================

export interface PhotoHistoryEntry {
  id: string;
  uri: string;
  capturedAt: string;
  label?: string;
  scanId?: string;
}

export interface SunExposureEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  temperature?: number;
  notes?: string;
}

export interface BonsaiTimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: WateringEventType | "scan" | "sunExposure" | "note";
  title: string;
  description?: string;
}

export interface Bonsai {
  // Identifiers & Naming
  id: string; // UUID or generated ID
  nickname: string; // User-given name (e.g., "Mi Junípero")
  originalName?: string; // Original name from detection or species
  species?: string; // Scientific name of the species
  commonName?: string; // Common name (e.g., "Juniperus Procumbens")
  speciesConfidence?: number; // Confidence score from detection (0-1)

  // Substrate Information
  substrate?: Substrato[];
  isInPot?: boolean;
  potType?: string;
  lastRepotDate?: string; // ISO date

  // Tracking
  dateAdded: string; // ISO date when bonsai was added
  lastWatering: string | null;

  // Statistics
  wateringHistory: WateringEvent[];
  scanHistory: string[][]; // Array of photo URIs from each scan
  allPhotos: string[]; // All photos taken
  photoHistory: PhotoHistoryEntry[]; // Detailed photo history
  heroPhoto?: string; // Cover photo
  sunExposureHistory: SunExposureEvent[];
  timeline: BonsaiTimelineEvent[];

  // Metrics
  daily: number; // waterings today
  monthly: number; // waterings this month
  yearly: number; // waterings this year

  // Health & Care
  lastHealthScore?: number;
  lastHealthStatus?: "critical" | "warning" | "stable" | "excellent";
  notes?: string;
}

// ==================== Health Input ====================

export interface BonsaiHealthInput {
  wateringHistory: WateringEvent[];
  lastWatering: string | Date | null;
  temperature?: number;
  season?: "Verano" | "Invierno" | "Primavera" | "Otoño";
}

// ==================== Health Score Result ====================

export interface HealthScoreResult {
  score: number;
  status: "critical" | "warning" | "stable" | "excellent";
  message: string;
}

// ==================== Species Detection ====================

export interface SpeciesDetectionResult {
  species: string;
  commonName?: string;
  confidence: number;
  description?: string;
  imageUrl?: string;
}

// ==================== Care Tips ====================

export interface CareTip {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  season?: "Verano" | "Invierno" | "Primavera" | "Otoño";
}

export interface SpeciesCareTips {
  species: string;
  commonName: string;
  wateringFrequency: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  sunlight: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: string;
  generalTips: CareTip[];
  substrateRecommendations: SubstratoType[];
  fertilizationSchedule: {
    season: string;
    frequency: string;
    intensity: string;
  }[];
}

// ==================== Store State ====================

export interface BonsaiStoreState {
  // Bonsai Collection
  bonsais: Bonsai[];
  currentBonsaiId: string | null; // ID of the currently viewed/active bonsai
  isSyncing: boolean;
  syncError: string | null;
  activeUserId: string | null;

  // Actions
  addBonsai: (bonsai: Omit<Bonsai, "id">) => string; // Returns the new bonsai ID
  removeBonsai: (id: string) => void;
  updateBonsai: (id: string, updates: Partial<Bonsai>) => void;
  setCurrentBonsai: (id: string) => void;
  getCurrentBonsai: () => Bonsai | null;

  // Photo Management
  addPhoto: (bonsaiId: string, photoUri: string) => void;
  setHeroPhoto: (bonsaiId: string, photoUri: string) => void;
  addScan: (bonsaiId: string, photoUris: string[]) => void;
  deletePhoto: (bonsaiId: string, photoId: string) => void;
  deletePhotos: (bonsaiId: string, photoIds: string[]) => void;

  // Timeline & Exposure
  addTimelineEvent: (
    bonsaiId: string,
    event: Omit<BonsaiTimelineEvent, "id">,
  ) => void;
  addSunExposureEvent: (
    bonsaiId: string,
    exposure: Omit<SunExposureEvent, "id">,
  ) => void;

  // Watering
  water: (bonsaiId: string, intensity?: number) => void;
  undoLastWatering: (bonsaiId: string) => void;
  recordWateringEvent: (bonsaiId: string, event: WateringEvent) => void;

  // Persistence
  importBonsais: (bonsais: Bonsai[]) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  hydrateFromRemote: (bonsais: Bonsai[]) => void;
  setSyncState: (state: {
    isSyncing?: boolean;
    syncError?: string | null;
    activeUserId?: string | null;
  }) => void;
  resetForSignedOutUser: () => void;
}
