import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import type { MarkedDates } from "react-native-calendars/src/types";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";
import { useBonsaiStore } from "@/store/bonsaiStore";
import { getLocalDateString } from "@/utils/dateTime";

export default function CalendarScreen() {
  const currentBonsai = useBonsaiStore((state) =>
    state.bonsais.find((b) => b.id === state.currentBonsaiId),
  );

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(),
  );

  const timelineEvents = useMemo(
    () => currentBonsai?.timeline ?? [],
    [currentBonsai?.timeline],
  );

  const markedDates = useMemo(() => {
    return timelineEvents.reduce<MarkedDates>((acc, event) => {
      acc[event.date] = {
        marked: true,
        dotColor:
          event.type === "water"
            ? THEME.colors.primary
            : event.type === "sunExposure"
              ? THEME.colors.warning
              : THEME.colors.secondary,
      };
      return acc;
    }, {});
  }, [timelineEvents]);

  const selectedEvents = useMemo(
    () => timelineEvents.filter((event) => event.date === selectedDate),
    [timelineEvents, selectedDate],
  );

  if (!currentBonsai) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.emptyText}>
          Selecciona un bonsái para ver el historial.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Calendario de Bonsái</Text>

        <Calendar
          markedDates={markedDates}
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            backgroundColor: THEME.colors.background,
            calendarBackground: THEME.colors.background,
            dayTextColor: THEME.colors.text,
            monthTextColor: THEME.colors.text,
            arrowColor: THEME.colors.primary,
            todayTextColor: THEME.colors.primary,
            selectedDayBackgroundColor: THEME.colors.primary,
            selectedDayTextColor: "#fff",
          }}
        />

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Eventos del {selectedDate}</Text>
          {selectedEvents.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay eventos registrados para esta fecha.
            </Text>
          ) : (
            selectedEvents.map((event, index) => (
              <View key={`${event.id}-${index}`} style={styles.eventRow}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                {event.description ? (
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen histórico</Text>
          <Text style={styles.summaryText}>
            Total de eventos: {timelineEvents.length}
          </Text>
          <Text style={styles.summaryText}>
            Fotos registradas: {currentBonsai.photoHistory?.length ?? 0}
          </Text>
          <Text style={styles.summaryText}>
            Exposiciones solares:{" "}
            {currentBonsai.sunExposureHistory?.length ?? 0}
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
    padding: THEME.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.sm,
  },
  eventRow: {
    marginBottom: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  eventTime: {
    color: THEME.colors.muted,
    marginTop: 4,
  },
  eventDescription: {
    marginTop: THEME.spacing.xs,
    color: THEME.colors.muted,
  },
  summaryCard: {
    marginTop: THEME.spacing.lg,
    backgroundColor: "#fff",
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: THEME.spacing.sm,
  },
  summaryText: {
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  emptyText: {
    color: THEME.colors.muted,
    lineHeight: 22,
    marginTop: THEME.spacing.sm,
  },
});
