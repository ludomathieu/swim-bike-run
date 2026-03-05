// HistoryScreen n'est plus utilisé directement dans la navigation.
// L'historique est maintenant intégré dans ProfileScreen.
// Ce fichier est conservé pour éviter les erreurs d'import.

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historique disponible dans Mon Compte</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#7878A0', fontSize: 14 },
});
