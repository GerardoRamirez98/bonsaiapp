import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";
import {
  loadUserBonsais,
  onAuthStateChangedListener,
  registerWithEmail,
  saveUserBonsais,
  signInWithEmail,
  signOutUser,
} from "@/services/firebase";
import {
  requestNotificationPermissions,
  scheduleWaterReminder,
} from "@/services/notifications";
import { getOpenAICareSuggestion } from "@/services/openai";
import { useBonsaiStore } from "@/store/bonsaiStore";
import { Bonsai } from "@/types/bonsai";
import { generateBonsaisCsv } from "@/utils/exportBonsais";

const fallbackSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const fallbackRadius = {
  sm: 12,
  md: 20,
  lg: 28,
  full: 999,
};

const fallbackShadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
};

const spacing = THEME?.spacing ?? fallbackSpacing;
const radius = THEME?.radius ?? fallbackRadius;
const shadows = THEME?.shadows ?? fallbackShadows;

export default function ProfileScreen() {
  const currentBonsai = useBonsaiStore((state) => state.getCurrentBonsai());
  const bonsais = useBonsaiStore((state) => state.bonsais);
  const importBonsais = useBonsaiStore((state) => state.importBonsais);

  const [firebaseStatus, setFirebaseStatus] = useState("Verificando...");
  const [authUser, setAuthUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("Pendiente");
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      setFirebaseStatus("Firebase listo");
    } catch (error) {
      console.warn(error);

      setFirebaseStatus(
        "Firebase no configurado - revisa variables de entorno",
      );
    }

    const unsubscribe = onAuthStateChangedListener((user) => {
      setAuthUser(user);

      setFirebaseStatus(
        user ? `Autenticado como ${user.email}` : "Firebase listo - sin sesión",
      );
    });

    return unsubscribe;
  }, []);
  const handleRegister = async () => {
    if (!authEmail || !authPassword) {
      Alert.alert(
        "Credenciales faltantes",
        "Ingresa correo y contraseña para registrarte.",
      );
      return;
    }

    try {
      setIsLoading(true);
      await registerWithEmail(authEmail, authPassword);
      setAuthMessage("Registro exitoso. Puedes usar la app sincronizada.");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error de registro",
        "No se pudo crear la cuenta. Revisa tus datos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!authEmail || !authPassword) {
      Alert.alert(
        "Credenciales faltantes",
        "Ingresa correo y contraseña para iniciar sesión.",
      );
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(authEmail, authPassword);
      setAuthMessage("Sesión iniciada correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error de inicio",
        "No se pudo iniciar sesión. Revisa tus datos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setAuthMessage("Sesión cerrada.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const handleAskAI = async () => {
    setIsLoading(true);
    const prompt = currentBonsai
      ? `Dame consejos prácticos para cuidar un bonsái ${currentBonsai.species ?? "desconocido"} con último riego el ${currentBonsai.lastWatering ?? "desconocido"} y ${currentBonsai.sunExposureHistory?.length ?? 0} exposiciones solares registradas.`
      : "Dame consejos prácticos para cuidar un bonsái y cómo lograr una salud excelente.";

    const result = await getOpenAICareSuggestion(prompt);
    setAiResult(result.text);
    setIsLoading(false);
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotificationStatus(
      granted ? "Permisos otorgados" : "Permisos denegados",
    );

    if (!granted) {
      Alert.alert(
        "Permisos denegados",
        "Necesitas permitir notificaciones para programar recordatorios.",
      );
    }
  };

  const handleScheduleReminder = async () => {
    if (!currentBonsai) {
      Alert.alert(
        "Selecciona un bonsái",
        "Selecciona un bonsái desde Inicio antes de programar un recordatorio.",
      );
      return;
    }

    const identifier = await scheduleWaterReminder(
      currentBonsai.nickname ?? "tu bonsái",
      60,
    );

    if (identifier) {
      setReminderMessage("Recordatorio programado en 1 minuto.");
    } else {
      setReminderMessage("No se pudo programar el recordatorio.");
    }
  };

  const handleBackupToCloud = async () => {
    if (!authUser) {
      Alert.alert(
        "Inicia sesión",
        "Inicia sesión para guardar un respaldo en la nube.",
      );
      return;
    }

    try {
      setIsLoading(true);
      await saveUserBonsais(authUser.uid, bonsais);
      setBackupStatus("Backup guardado en Firestore correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error al respaldar",
        "No se pudo guardar los bonsáis en la nube.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!authUser) {
      Alert.alert(
        "Inicia sesión",
        "Inicia sesión para restaurar desde la nube.",
      );
      return;
    }

    try {
      setIsLoading(true);
      const cloudBonsais = await loadUserBonsais(authUser.uid);
      if (!cloudBonsais || cloudBonsais.length === 0) {
        Alert.alert(
          "Sin datos en la nube",
          "No se encontró respaldo para esta cuenta.",
        );
        return;
      }

      importBonsais(cloudBonsais as Bonsai[]);
      setBackupStatus("Restauración completa desde Firestore.");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error al restaurar",
        "No se pudieron cargar los bonsáis guardados.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    const csv = generateBonsaisCsv(bonsais);

    if (bonsais.length === 0) {
      Alert.alert("Sin datos", "Agrega al menos un bonsái antes de exportar.");
      return;
    }

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bonsais_export.csv";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      await Share.share({ title: "Exportar bonsáis", message: csv });
    } catch (error) {
      console.error(error);
      Alert.alert("Error al exportar", "No se pudo compartir el archivo CSV.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de Firebase</Text>
          <Text style={styles.cardText}>{firebaseStatus}</Text>
          {authUser ? (
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonSecondaryText}>Cerrar sesión</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {!authUser ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Autenticación</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={authEmail}
              onChangeText={setAuthEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={authPassword}
              onChangeText={setAuthPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonSecondaryText}>Iniciar sesión</Text>
            </TouchableOpacity>
            {authMessage ? (
              <Text style={styles.message}>{authMessage}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <Text style={styles.cardText}>Estado: {notificationStatus}</Text>
          <TouchableOpacity style={styles.button} onPress={handleNotifications}>
            <Text style={styles.buttonText}>Solicitar permisos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={handleScheduleReminder}
          >
            <Text style={styles.buttonSecondaryText}>
              Programar recordatorio de prueba
            </Text>
          </TouchableOpacity>
          {reminderMessage ? (
            <Text style={styles.message}>{reminderMessage}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Respaldo en la nube</Text>
          <Text style={styles.cardText}>
            Guarda y restaura tus bonsáis en Firebase.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleBackupToCloud}>
            <Text style={styles.buttonText}>Guardar en la nube</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={handleRestoreFromCloud}
          >
            <Text style={styles.buttonSecondaryText}>
              Restaurar desde la nube
            </Text>
          </TouchableOpacity>
          {backupStatus ? (
            <Text style={styles.message}>{backupStatus}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exportar datos</Text>
          <Text style={styles.cardText}>
            Exporta tus bonsáis a un archivo CSV.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleExportCsv}>
            <Text style={styles.buttonText}>Exportar CSV</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sugerencia de OpenAI</Text>
          <Text style={styles.cardText}>
            Usa este botón para obtener ideas de cuidado personalizado para tu
            bonsái.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleAskAI}>
            <Text style={styles.buttonText}>Pedir consejo</Text>
          </TouchableOpacity>
          {isLoading ? (
            <ActivityIndicator
              color={THEME.colors.primary}
              style={styles.loader}
            />
          ) : aiResult ? (
            <Text style={styles.aiResult}>{aiResult}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <Text style={styles.cardText}>
            Bonsáis registrados: {bonsais.length}
          </Text>
          <Text style={styles.cardText}>
            Bonsái seleccionado: {currentBonsai?.nickname ?? "Ninguno"}
          </Text>
          <Text style={styles.cardText}>
            Fotos totales: {currentBonsai?.photoHistory?.length ?? 0}
          </Text>
          <Text style={styles.cardText}>
            Exposiciones solares:{" "}
            {currentBonsai?.sunExposureHistory?.length ?? 0}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  title: {
    fontSize: THEME.typography.h2.fontSize,
    fontWeight: THEME.typography.h2.fontWeight,
    color: THEME.colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: THEME.typography.h3.fontSize,
    fontWeight: THEME.typography.h3.fontWeight,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  cardText: {
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.muted,
    marginBottom: THEME.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: THEME.typography.body.fontSize,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  buttonText: {
    color: THEME.colors.surface,
    fontSize: THEME.typography.body.fontSize,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  buttonSecondaryText: {
    color: THEME.colors.primary,
    fontSize: THEME.typography.body.fontSize,
    fontWeight: "600",
  },
  message: {
    fontSize: THEME.typography.caption.fontSize,
    color: THEME.colors.primary,
    marginTop: THEME.spacing.sm,
  },
  loader: {
    marginTop: THEME.spacing.md,
  },
  aiResult: {
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.text,
    marginTop: THEME.spacing.md,
    lineHeight: 24,
  },
});
