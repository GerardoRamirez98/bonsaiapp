import Constants from "expo-constants";
import { Platform } from "react-native";

process.env.EXPO_NO_AUTO_REGISTER_PUSH_TOKEN = "true";

type ExpoNotifications = typeof import("expo-notifications");

let notificationHandlerInitialized = false;
let notificationsModule: ExpoNotifications | null = null;

function isExpoGo() {
  return Constants.appOwnership === "expo";
}

async function getNotifications() {
  if (isExpoGo()) {
    return null;
  }

  notificationsModule ??= await import("expo-notifications");
  return notificationsModule;
}

async function initializeNotificationHandler(
  Notifications: ExpoNotifications,
) {
  if (notificationHandlerInitialized) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationHandlerInitialized = true;
}

export async function requestNotificationPermissions() {
  try {
    const Notifications = await getNotifications();

    if (!Notifications) {
      console.warn(
        "Las notificaciones no estan disponibles en Expo Go con este SDK.",
      );
      return false;
    }

    await initializeNotificationHandler(Notifications);

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.warn("Error al solicitar permisos:", error);
    return false;
  }
}

export async function scheduleWaterReminder(
  bonsaiName: string,
  secondsFromNow = 60,
) {
  try {
    const Notifications = await getNotifications();

    if (!Notifications) {
      console.warn(
        "Los recordatorios no estan disponibles en Expo Go con este SDK.",
      );
      return null;
    }

    await initializeNotificationHandler(Notifications);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("bonsai-reminders", {
        name: "Recordatorios Bonsai",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recordatorio Bonsai",
        body: `Revisa el riego de ${bonsaiName}`,
        sound: "default",
        data: { bonsaiName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsFromNow,
      },
    });

    return identifier;
  } catch (error) {
    console.error("Error programando notificacion:", error);
    return null;
  }
}

export async function cancelNotification(identifier: string) {
  try {
    const Notifications = await getNotifications();

    if (!Notifications) {
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error("Error cancelando notificacion:", error);
  }
}
