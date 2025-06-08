// app/(dashboard)/index.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useDashboard } from '../../hooks/useDashboard';
import AttributeBar from '../../src/components/character/AttributeBar';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { character, loading, error, refreshData, updateAttributes } = useDashboard();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [attributes, setAttributes] = useState({
    strength: 0,
    intelligence: 0,
    endurance: 0,
    availablePoints: 0,
  });

  // Initialiser les attributs quand le personnage est chargé
  React.useEffect(() => {
    if (character) {
      setAttributes({
        strength: character.strength,
        intelligence: character.intelligence,
        endurance: character.endurance,
        availablePoints: character.availablePoints,
      });
    }
  }, [character]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAttributeIncrement = (attribute: 'strength' | 'intelligence' | 'endurance') => {
    if (attributes.availablePoints > 0) {
      setAttributes(prev => ({
        ...prev,
        [attribute]: prev[attribute] + 1,
        availablePoints: prev.availablePoints - 1,
      }));
    }
  };

  const handleAttributeDecrement = (attribute: 'strength' | 'intelligence' | 'endurance') => {
    if (!character) return;
    
    const originalValue = character[attribute];
    if (attributes[attribute] > originalValue) {
      setAttributes(prev => ({
        ...prev,
        [attribute]: prev[attribute] - 1,
        availablePoints: prev.availablePoints + 1,
      }));
    }
  };

  const handleAllocatePoints = async () => {
    try {
      await updateAttributes(attributes);
      Alert.alert('Succès!', 'Les attributs ont été alloués avec succès!');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les attributs');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getClassColor = (characterClass: string) => {
    switch (characterClass) {
      case 'WARRIOR': return Colors.warrior;
      case 'MAGE': return Colors.mage;
      case 'ROGUE': return Colors.rogue;
      default: return Colors.warrior;
    }
  };

  const getClassDisplayName = (characterClass: string) => {
    switch (characterClass) {
      case 'WARRIOR': return 'Warrior';
      case 'MAGE': return 'Mage';
      case 'ROGUE': return 'Rogue';
      default: return 'Unknown';
    }
  };

  if (loading && !character) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Chargement des données du personnage..." />
      </View>
    );
  }

  if (error && !character) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Aucun personnage trouvé</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expPercentage = character.maxExpNeeded === 0 ? 100 : (character.experience / character.maxExpNeeded) * 100;
  const classColors = getClassColor(character.class);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header avec bouton de déconnexion */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bonjour, {user?.name}!</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutHeaderButton}>
            <Text style={styles.logoutHeaderText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* Character Info Card */}
        <View style={styles.characterCard}>
          <View style={[styles.characterHeader, { backgroundColor: classColors.bg }]}>
            <Text style={styles.characterName}>{character.name}</Text>
            <View style={styles.characterMeta}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level {character.level}</Text>
              </View>
              <Text style={[styles.classText, { color: classColors.text }]}>
                {getClassDisplayName(character.class)}
              </Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Points disponibles:</Text>
              <Text style={styles.pointsValue}>{attributes.availablePoints}</Text>
            </View>
            <View style={styles.expContainer}>
              <View style={styles.expHeader}>
                <Text style={styles.expLabel}>XP</Text>
                <Text style={styles.expText}>
                  {character.experience} / {character.maxExpNeeded || '-'}
                </Text>
              </View>
              <View style={styles.expBar}>
                <View style={[styles.expFill, { width: `${expPercentage}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.attributesSection}>
            <Text style={styles.sectionTitle}>Attributs</Text>
            <AttributeBar
              label="Force"
              value={attributes.strength}
              color={Colors.error}
              iconColor="#EF4444"
              iconBg="#7F1D1D"
              onIncrement={() => handleAttributeIncrement('strength')}
              onDecrement={() => handleAttributeDecrement('strength')}
              disabledIncrement={attributes.availablePoints === 0}
              disabledDecrement={attributes.strength <= character.strength}
            />
            <AttributeBar
              label="Intelligence"
              value={attributes.intelligence}
              color={Colors.primary}
              iconColor="#3B82F6"
              iconBg="#1E3A8A"
              onIncrement={() => handleAttributeIncrement('intelligence')}
              onDecrement={() => handleAttributeDecrement('intelligence')}
              disabledIncrement={attributes.availablePoints === 0}
              disabledDecrement={attributes.intelligence <= character.intelligence}
            />
            <AttributeBar
              label="Endurance"
              value={attributes.endurance}
              color={Colors.success}
              iconColor="#10B981"
              iconBg="#064E3B"
              onIncrement={() => handleAttributeIncrement('endurance')}
              onDecrement={() => handleAttributeDecrement('endurance')}
              disabledIncrement={attributes.availablePoints === 0}
              disabledDecrement={attributes.endurance <= character.endurance}
            />
            
            <TouchableOpacity 
              style={[
                styles.allocateButton,
                (attributes.strength === character.strength && 
                 attributes.intelligence === character.intelligence && 
                 attributes.endurance === character.endurance) && styles.allocateButtonDisabled
              ]} 
              onPress={handleAllocatePoints}
              disabled={
                attributes.strength === character.strength && 
                attributes.intelligence === character.intelligence && 
                attributes.endurance === character.endurance
              }
            >
              <Text style={styles.allocateButtonText}>Allouer les points</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quest Summary */}
        <View style={styles.questSummaryCard}>
          <Text style={styles.sectionTitle}>Résumé des quêtes</Text>
          <View style={styles.questStats}>
            <View style={[styles.questStat, { backgroundColor: '#065F46' }]}>
              <Text style={styles.questStatNumber}>{character.quests.completed}</Text>
              <Text style={styles.questStatLabel}>Terminées</Text>
            </View>
            <View style={[styles.questStat, { backgroundColor: '#92400E' }]}>
              <Text style={styles.questStatNumber}>{character.quests.inProgress}</Text>
              <Text style={styles.questStatLabel}>En cours</Text>
            </View>
            <View style={[styles.questStat, { backgroundColor: '#7C2D12' }]}>
              <Text style={styles.questStatNumber}>{character.quests.failed}</Text>
              <Text style={styles.questStatLabel}>Échouées</Text>
            </View>
          </View>
        </View>

        {/* Skills & Inventory */}
        <View style={styles.bottomSection}>
          {/* Skills */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Compétences</Text>
              <TouchableOpacity onPress={() => router.push('/(dashboard)/skills')}>
                <Text style={styles.viewAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {character.skills.length > 0 ? (
              character.skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.skillLevel}>
                    <Text style={styles.skillLevelText}>
                      Niv {skill.level}/{skill.maxLevel}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>⚡</Text>
                <Text style={styles.emptyStateText}>Aucune compétence</Text>
              </View>
            )}
          </View>

          {/* Inventory */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Inventaire</Text>
              <TouchableOpacity onPress={() => router.push('/(dashboard)/inventory')}>
                <Text style={styles.viewAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {character.inventory.length > 0 ? (
              character.inventory.map((item) => (
                <View key={item.id} style={styles.inventoryItem}>
                  <View style={styles.inventoryItemInfo}>
                    <Text style={styles.inventoryItemName}>{item.name}</Text>
                    <Text style={styles.inventoryItemDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={styles.inventoryQuantity}>
                    <Text style={styles.inventoryQuantityText}>x{item.quantity}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎒</Text>
                <Text style={styles.emptyStateText}>Inventaire vide</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  logoutHeaderButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutHeaderText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  characterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  characterHeader: {
    padding: 24,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  characterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  classText: {
    fontSize: 14,
  },
  pointsContainer: {
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  expContainer: {
    marginTop: 8,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  expText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  expBar: {
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  attributesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  allocateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  allocateButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  allocateButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  questStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questStat: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  questStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  questStatLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  bottomSection: {
    flexDirection: 'row',
    gap: 16,
  },
  halfCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 14,
  },
  skillItem: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  skillLevel: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillLevelText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inventoryItem: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inventoryItemInfo: {
    flex: 1,
  },
  inventoryItemName: {
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  inventoryItemDesc: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  inventoryQuantity: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  inventoryQuantityText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});