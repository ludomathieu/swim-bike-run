import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowRight, Bike, Check, Footprints, Waves } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
const RACE_DATE_STORAGE_KEY = "@triathlon_race_date";
const RACE_NAME_STORAGE_KEY = "@triathlon_race_name";
const ONBOARDING_COMPLETED_KEY = "@triathlon_onboarding_completed";
const NEEDS_TRANSPORT_KEY = "@triathlon_needs_transport";
const GENERATE_GEAR_KEY = "@triathlon_generate_gear";

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

const ALL_ITEMS_BASE = buildItems();

const TriathlonChecklistScreen: React.FC = () => {
  const [checked, setChecked] = useState<ChecklistState>({});
  const [raceDate, setRaceDate] = useState("");
  const [raceName, setRaceName] = useState("");
  const [needsTransport, setNeedsTransport] = useState<boolean | null>(null);
  const [generateGear, setGenerateGear] = useState<boolean | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
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
        const [
          storedChecklist,
          storedRaceDate,
          storedRaceName,
          storedNeedsTransport,
          storedGenerateGear,
          storedOnboardingCompleted,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(RACE_DATE_STORAGE_KEY),
          AsyncStorage.getItem(RACE_NAME_STORAGE_KEY),
          AsyncStorage.getItem(NEEDS_TRANSPORT_KEY),
          AsyncStorage.getItem(GENERATE_GEAR_KEY),
          AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        ]);

        if (storedChecklist) {
          setChecked(JSON.parse(storedChecklist));
        }
        if (storedRaceDate) {
          setRaceDate(storedRaceDate);
        }
        if (storedRaceName) {
          setRaceName(storedRaceName);
        }
        if (storedNeedsTransport) {
          setNeedsTransport(storedNeedsTransport === "true");
        }
        if (storedGenerateGear) {
          setGenerateGear(storedGenerateGear === "true");
        }
        if (storedOnboardingCompleted !== "true") {
          setIsOnboarding(true);
        }
      } catch (error) {
        console.warn("Failed to load state", error);
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

  const finishOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        AsyncStorage.setItem(RACE_DATE_STORAGE_KEY, raceDate),
        AsyncStorage.setItem(RACE_NAME_STORAGE_KEY, raceName),
        AsyncStorage.setItem(NEEDS_TRANSPORT_KEY, String(needsTransport)),
        AsyncStorage.setItem(GENERATE_GEAR_KEY, String(generateGear)),
        AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true"),
      ]);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOnboarding(false);
    } catch (error) {
      console.warn("Failed to complete onboarding", error);
    } finally {
      setIsLoading(false);
    }
  }, [raceDate, raceName, needsTransport, generateGear]);

  const currentItems = useMemo(() => {
    const items = [...ALL_ITEMS_BASE];
    if (needsTransport) {
      items.push({
        id: "Logistic-Transport",
        label: "Réserver transport",
        category: "Bike", // Put it in Bike for now as it's logistics related
      });
    }
    return items;
  }, [needsTransport]);

  const sections = useMemo(() => {
    if (generateGear === false) return [];
    return (Object.keys(CHECKLIST_DATA) as CategoryKey[]).map((category) => ({
      title: category,
      color: CATEGORY_COLORS[category],
      data: currentItems.filter((item) => item.category === category),
    }));
  }, [generateGear, currentItems]);

  const nextStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOnboardingStep((prev) => prev + 1);
  };

  const renderOnboarding = () => {
    return (
      <View style={styles.onboardingContainer}>
        {onboardingStep === 1 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingQuestion}>Quand est ta prochaine course ?</Text>
            <TextInput
              style={styles.onboardingInput}
              value={raceDate}
              onChangeText={setRaceDate}
              placeholder="Ex: 12 Juin 2025"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <TouchableOpacity style={styles.onboardingButton} onPress={nextStep}>
              <Text style={styles.onboardingButtonText}>Continuer</Text>
              <ArrowRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {onboardingStep === 2 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingQuestion}>Nom de la course ?</Text>
            <TextInput
              style={styles.onboardingInput}
              value={raceName}
              onChangeText={setRaceName}
              placeholder="Ex: Triathlon d'Évian M"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <TouchableOpacity style={styles.onboardingButton} onPress={nextStep}>
              <Text style={styles.onboardingButtonText}>Continuer</Text>
              <ArrowRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {onboardingStep === 3 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingQuestion}>As-tu besoin de gérer le transport ?</Text>
            <View style={styles.onboardingOptions}>
              <TouchableOpacity
                style={[styles.optionButton, needsTransport === true && styles.optionButtonSelected]}
                onPress={() => {
                  setNeedsTransport(true);
                  setTimeout(nextStep, 300);
                }}
              >
                <Text style={[styles.optionText, needsTransport === true && styles.optionTextSelected]}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, needsTransport === false && styles.optionButtonSelected]}
                onPress={() => {
                  setNeedsTransport(false);
                  setTimeout(nextStep, 300);
                }}
              >
                <Text style={[styles.optionText, needsTransport === false && styles.optionTextSelected]}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {onboardingStep === 4 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingQuestion}>Souhaites-tu générer la liste du matériel obligatoire ?</Text>
            <View style={styles.onboardingOptions}>
              <TouchableOpacity
                style={[styles.optionButton, generateGear === true && styles.optionButtonSelected]}
                onPress={() => {
                  setGenerateGear(true);
                }}
              >
                <Text style={[styles.optionText, generateGear === true && styles.optionTextSelected]}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, generateGear === false && styles.optionButtonSelected]}
                onPress={() => {
                  setGenerateGear(false);
                }}
              >
                <Text style={[styles.optionText, generateGear === false && styles.optionTextSelected]}>Non</Text>
              </TouchableOpacity>
            </View>
            {(generateGear !== null) && (
              <View style={{ marginTop: 24 }}>
                <TouchableOpacity style={styles.onboardingButton} onPress={finishOnboarding}>
                  <Text style={styles.onboardingButtonText}>Terminer</Text>
                  <Check size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

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
        {isOnboarding ? (
          renderOnboarding()
        ) : (
          <>
            <Text style={styles.title}>Checklist triathlon</Text>
            <Text style={styles.subtitle}>
              {raceName || "Ma course"} • {raceDate}
            </Text>

            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {sections.length > 0 ? (
                sections.map((section) => (
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
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aucun matériel à afficher.</Text>
                </View>
              )}
            </ScrollView>
          </>
        )}

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
    marginBottom: 20,
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateIcon: {
    marginRight: 8,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "System",
  },
  dateInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    fontFamily: "System",
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
  onboardingContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  onboardingStep: {
    alignItems: "flex-start",
  },
  onboardingQuestion: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 24,
    lineHeight: 32,
  },
  onboardingInput: {
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#0A84FF",
    width: "100%",
    paddingVertical: 8,
    color: "#111827",
    marginBottom: 32,
  },
  onboardingButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  onboardingOptions: {
    width: "100%",
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  optionButtonSelected: {
    borderColor: "#0A84FF",
    backgroundColor: "#F0F7FF",
  },
  optionText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#0A84FF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
