export const EQUIPMENT_CATEGORIES = {
  swim: {
    label: '🏊 Natation',
    color: '#00D4FF',
    items: [
      { id: 's1', label: 'Combinaison néoprène' },
      { id: 's2', label: 'Lunettes de natation (x2)' },
      { id: 's3', label: 'Bonnet de bain' },
      { id: 's4', label: "Bouchons d'oreilles" },
      { id: 's5', label: 'Crème anti-frottement' },
    ],
  },
  bike: {
    label: '🚴 Vélo',
    color: '#FF6B00',
    items: [
      { id: 'b1', label: 'Vélo (révisé)' },
      { id: 'b2', label: 'Casque homologué' },
      { id: 'b3', label: 'Chaussures de vélo' },
      { id: 'b4', label: 'Bidons remplis (x2)' },
      { id: 'b5', label: 'Chambre à air + démonte-pneu' },
      { id: 'b6', label: 'CO2 + cartouche' },
      { id: 'b7', label: 'Kit multi-outils vélo' },
      { id: 'b8', label: 'Numéro de dossard vélo' },
    ],
  },
  run: {
    label: '🏃 Course',
    color: '#00FF88',
    items: [
      { id: 'r1', label: 'Chaussures de course' },
      { id: 'r2', label: 'Chaussettes de course' },
      { id: 'r3', label: 'Dossard course' },
      { id: 'r4', label: 'Ceinture porte-dossard' },
      { id: 'r5', label: 'Casquette / visière' },
      { id: 'r6', label: 'Collants / manchons de compression' },
    ],
  },
  nutrition: {
    label: '🍌 Nutrition',
    color: '#FFB800',
    items: [
      { id: 'n1', label: 'Gels énergétiques (course)' },
      { id: 'n2', label: 'Barres / gels (vélo)' },
      { id: 'n3', label: 'Boisson isotonique (bidons)' },
      { id: 'n4', label: 'Boisson de récupération' },
      { id: 'n5', label: 'Banane / aliment solide pré-course' },
      { id: 'n6', label: 'Sel / électrolytes' },
    ],
  },
  general: {
    label: '🎒 Général',
    color: '#7878A0',
    items: [
      { id: 'g1', label: 'Licence triathlon / inscription' },
      { id: 'g2', label: "Pièce d'identité" },
      { id: 'g3', label: 'Montre GPS' },
      { id: 'g4', label: 'Chargeur montre GPS + câble' },
      { id: 'g5', label: 'Chargeur capteurs (cardio, puissance…)' },
      { id: 'g6', label: 'Crème solaire' },
      { id: 'g7', label: 'Serviette' },
      { id: 'g8', label: 'Sac de transition' },
      { id: 'g9', label: 'Vêtements post-course' },
      { id: 'g10', label: 'Argent / carte bancaire' },
      { id: 'g11', label: 'Téléphone chargé + écouteurs' },
    ],
  },
};

export const ALL_ITEMS = Object.values(EQUIPMENT_CATEGORIES).flatMap(c => c.items);

// ─── Veille de course ────────────────────────────────────────────────────────

export const PRE_RACE_CATEGORIES = {
  bike: {
    label: '🚴 Vélo & Transition',
    color: '#FF6B00',
    items: [
      { id: 'pr1', label: 'Vérifier la pression des pneus' },
      { id: 'pr2', label: 'Vérifier le fonctionnement des freins' },
      { id: 'pr3', label: 'Vérifier la chaîne (graissage)' },
      { id: 'pr4', label: 'Coller les étiquettes sur le vélo et le casque' },
      { id: 'pr5', label: 'Repérer son emplacement en zone de transition' },
      { id: 'pr6', label: 'Préparer la disposition du matériel en transition' },
      { id: 'pr7', label: 'Charger le GPS / la montre' },
    ],
  },
  swim: {
    label: '🏊 Natation',
    color: '#00D4FF',
    items: [
      { id: 'pr8',  label: "Vérifier l'état de la combinaison" },
      { id: 'pr9',  label: 'Préparer lunettes + bonnet dans le sac' },
      { id: 'pr10', label: "Vérifier les horaires de mise à l'eau" },
    ],
  },
  general: {
    label: '🎒 Logistique',
    color: '#7878A0',
    items: [
      { id: 'pr11', label: 'Repérer le parcours sur la carte' },
      { id: 'pr12', label: "Vérifier l'heure de départ de sa vague" },
      { id: 'pr13', label: 'Préparer le sac de transition' },
      { id: 'pr14', label: 'Préparer la tenue de course complète' },
      { id: 'pr15', label: 'Vérifier les conditions météo' },
      { id: 'pr16', label: "Planifier le trajet jusqu'au site" },
      { id: 'pr17', label: 'Mettre en charge tous les appareils électroniques' },
      { id: 'pr18', label: 'Préparer la nutrition course (gels, barres, bidons)' },
      { id: 'pr19', label: 'Préparer le petit-déjeuner du matin de course' },
    ],
  },
  recovery: {
    label: '😴 Récupération',
    color: '#00FF88',
    items: [
      { id: 'pr20', label: 'Préparer une alarme (+ une de secours)' },
      { id: 'pr21', label: "Bien s'hydrater dans la journée" },
      { id: 'pr22', label: 'Faire un repas riche en glucides (pasta party 🍝)' },
    ],
  },
};

export const ALL_PRE_RACE_ITEMS = Object.values(PRE_RACE_CATEGORIES).flatMap(c => c.items);
