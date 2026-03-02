import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bike, Footprints, Waves } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

type CategoryKey = "Swim" | "Bike" | "Run";

type ChecklistItem = {
  id: string;
  label: string;
  category: CategoryKey;
};

type ChecklistState = Record<string, boolean>;

const CHECKLIST_DATA: Record<CategoryKey, string[]> = {
  Swim: ["Combinaison", "Lunettes", "Bonnet"],
  Bike: ["Vélo", "Casque", "Chaussures", "Kit réparation"],
  Run: ["Chaussures", "Porte-dossard", "Casquette"],
};

const CATEGORY_COLORS: Record<CategoryKey, string> = {
  Swim: "#0A84FF", // Apple blue
  Bike: "#FF9F0A", // Apple orange
  Run: "#30D158", // Apple green
};

const STORAGE_KEY = "@triathlon_checklist_state";

const buildItems = (): ChecklistItem[] => {
  const items: ChecklistItem[] = [];

  (Object.keys(CHECKLIST_DATA) as CategoryKey[]).forEach((category) => {
    CHECKLIST_DATA[category].forEach((label) => {
      items.push({
        id: `${category}-${label}`,
        label,
        category,
      });
    });
  });

  return items;
};

const ALL_ITEMS = buildItems();

const TriathlonChecklistScreen: React.FC = () => {
  const [checked, setChecked] = useState<ChecklistState>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setChecked(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Failed to load checklist state", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  const persistState = useCallback(async (nextState: ChecklistState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.warn("Failed to save checklist state", error);
    }
  }, []);

  const toggleItem = useCallback(
    (itemId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setChecked((prev) => {
        const next = { ...prev, [itemId]: !prev[itemId] };
        void persistState(next);
        return next;
      });
    },
    [persistState],
  );

  const sections = (Object.keys(CHECKLIST_DATA) as CategoryKey[]).map(
    (category) => ({
      title: category,
      color: CATEGORY_COLORS[category],
      data: ALL_ITEMS.filter((item) => item.category === category),
    }),
  );

  const renderItem = ({ item }: { item: ChecklistItem }) => {
    const isChecked = !!checked[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.itemContainer,
          isChecked && styles.itemContainerChecked,
        ]}
        onPress={() => toggleItem(item.id)}
      >
        <View
          style={[
            styles.checkbox,
            isChecked && styles.checkboxChecked,
            { borderColor: CATEGORY_COLORS[item.category] },
          ]}
        >
          {isChecked && <View style={styles.checkboxInner} />}
        </View>
        <Text
          style={[
            styles.itemLabel,
            isChecked && styles.itemLabelChecked,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Checklist triathlon</Text>
        <Text style={styles.subtitle}>
          Prépare ton matériel pour être serein le jour J.
        </Text>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <View style={styles.sectionHeaderContainer}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    { backgroundColor: section.color },
                  ]}
                >
                  {section.title === "Swim" && (
                    <Waves color="#FFFFFF" size={18} strokeWidth={2.4} />
                  )}
                  {section.title === "Bike" && (
                    <Bike color="#FFFFFF" size={18} strokeWidth={2.4} />
                  )}
                  {section.title === "Run" && (
                    <Footprints color="#FFFFFF" size={18} strokeWidth={2.4} />
                  )}
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.sectionItemsContainer}>
                {section.data.map((item) => (
                  <View key={item.id} style={styles.sectionItemWrapper}>
                    {renderItem({ item })}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Chargement…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TriathlonChecklistScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7", // iOS grouped background
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "System",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    fontFamily: "System",
    marginBottom: 24,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "System",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  itemContainerChecked: {
    backgroundColor: "#E5E7EB",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  itemLabel: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    fontFamily: "System",
  },
  itemLabelChecked: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: "#9CA3AF",
    color: "#9CA3AF",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(242,242,247,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "System",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionItemsContainer: {
    marginTop: 8,
  },
  sectionItemWrapper: {
    marginBottom: 8,
  },
});

