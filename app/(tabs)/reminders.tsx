import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const RACE_DATE_STORAGE_KEY = "@triathlon_race_date";

interface Reminder {
  id: string;
  title: string;
  daysBefore: number;
  date: Date;
}

const RemindersScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [raceDateStr, setRaceDateStr] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadRaceDate = async () => {
        try {
          const stored = await AsyncStorage.getItem(RACE_DATE_STORAGE_KEY);
          setRaceDateStr(stored);
        } catch (error) {
          console.warn("Failed to load race date in reminders", error);
        }
      };
      loadRaceDate();
    }, []),
  );

  // Simulation d'une date de course (aujourd'hui + 10 jours) si non définie
  let raceDate: Date;
  if (raceDateStr && !isNaN(Date.parse(raceDateStr))) {
    raceDate = new Date(raceDateStr);
  } else {
    raceDate = new Date();
    raceDate.setDate(raceDate.getDate() + 10);
  }

  const reminders: Reminder[] = [
    {
      id: "1",
      title: "Check mécanique vélo",
      daysBefore: 7,
      date: new Date(raceDate),
    },
    {
      id: "2",
      title: "Préparation des sacs de transition",
      daysBefore: 3,
      date: new Date(raceDate),
    },
    {
      id: "3",
      title: "Retrait dossard",
      daysBefore: 1,
      date: new Date(raceDate),
    },
  ];

  reminders.forEach((r) => {
    const d = new Date(raceDate);
    d.setDate(raceDate.getDate() - r.daysBefore);
    r.date = d;
  });

  const renderReminder = ({ item }: { item: Reminder }) => (
    <View
      style={[
        styles.reminderCard,
        { backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF" },
      ]}
    >
      <View style={styles.reminderInfo}>
        <Text style={styles.reminderDay}>J-{item.daysBefore}</Text>
        <Text style={[styles.reminderTitle, { color: theme.text }]}>{item.title}</Text>
      </View>
      <Text style={styles.reminderDate}>
        {item.date.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colorScheme === "dark" ? "#000000" : "#F2F2F7" },
      ]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Rappels</Text>
        <Text style={styles.subtitle}>
          Reste organisé avant le jour de ta course.
        </Text>

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={renderReminder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default RemindersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 32,
  },
  reminderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reminderDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A84FF", // Apple Blue
    backgroundColor: "#E5F1FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  reminderDate: {
    fontSize: 13,
    color: "#8E8E93", // Apple Secondary Label
    marginLeft: 8,
  },
});
