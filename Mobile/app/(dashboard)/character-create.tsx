import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiService, handleApiError } from '../../src/services/apiService';

export default function CharacterCreationScreen() {
  const { user, setHasCharacter } = useAuth();
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState({
    name: '',
    class: 'WARRIOR',
    strength: 5,
    intelligence: 5,
    endurance: 5,
    remainingPoints: 5,
  });

  const handleAttributeChange = (attribute: string, value: number) => {
    const current = character[attribute as keyof typeof character] as number;
    const newValue = current + value;
    
    if (value > 0 && character.remainingPoints <= 0) return;
    if (newValue < 5) return;

    setCharacter(prev => ({
      ...prev,
      [attribute]: newValue,
      remainingPoints: prev.remainingPoints - value,
    }));
  };

  const handleCreateCharacter = async () => {
    if (!character.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour votre personnage');
      return;
    }

    if (character.remainingPoints > 0) {
      Alert.alert('Erreur', 'Vous devez distribuer tous vos points d\'attributs');
      return;
    }

    try {
      setLoading(true);
      
      await apiService.createCharacter({
        name: character.name,
        class: character.class,
        strength: character.strength,
        intelligence: character.intelligence,
        endurance: character.endurance,
      });

      // Mettre à jour le contexte auth
      setHasCharacter(true);
      
      Alert.alert(
        'Succès !', 
        'Votre personnage a été créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(dashboard)');
            }
          }
        ]
      );
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Création du personnage..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer votre Chasseur</Text>
        <Text style={styles.subtitle}>Bonjour {user?.name}, créez votre personnage !</Text>

        {/* Nom du personnage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nom du personnage</Text>
          <TextInput
            style={styles.input}
            value={character.name}
            onChangeText={(text) => setCharacter(prev => ({ ...prev, name: text }))}
            placeholder="Entrez le nom de votre chasseur"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Classe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classe</Text>
          <View style={styles.classGrid}>
            {[
              { key: 'WARRIOR', name: 'Guerrier', desc: 'Spécialisé en combat au corps à corps' },
              { key: 'MAGE', name: 'Mage', desc: 'Maître de la magie et des sorts' },
              { key: 'ROGUE', name: 'Assassin', desc: 'Agile et discret, expert en attaques furtives' },
            ].map((classType) => (
              <TouchableOpacity
                key={classType.key}
                style={[
                  styles.classButton,
                  character.class === classType.key && styles.classButtonSelected
                ]}
                onPress={() => setCharacter(prev => ({ ...prev, class: classType.key }))}
              >
                <Text style={[
                  styles.className,
                  character.class === classType.key && styles.classNameSelected
                ]}>
                  {classType.name}
                </Text>
                <Text style={styles.classDesc}>{classType.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Attributs */}
        <View style={styles.section}>
          <View style={styles.attributeHeader}>
            <Text style={styles.sectionTitle}>Attributs</Text>
            <Text style={styles.pointsRemaining}>
              Points restants: {character.remainingPoints}
            </Text>
          </View>
          
          {[
            { key: 'strength', name: 'Force', desc: 'Augmente les dégâts physiques' },
            { key: 'intelligence', name: 'Intelligence', desc: 'Augmente les dégâts magiques' },
            { key: 'endurance', name: 'Endurance', desc: 'Augmente les points de vie et la défense' },
          ].map((attr) => (
            <View key={attr.key} style={styles.attributeRow}>
              <View style={styles.attributeInfo}>
                <Text style={styles.attributeName}>{attr.name}</Text>
                <Text style={styles.attributeDesc}>{attr.desc}</Text>
              </View>
              <View style={styles.attributeControls}>
                <TouchableOpacity
                  style={[
                    styles.attributeButton,
                    Number(character[attr.key as keyof typeof character]) <= 5 && styles.attributeButtonDisabled
                  ]}
                  onPress={() => handleAttributeChange(attr.key, -1)}
                  disabled={Number(character[attr.key as keyof typeof character]) <= 5}
                >
                  <Text style={styles.attributeButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.attributeValue}>
                  {character[attr.key as keyof typeof character]}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.attributeButton,
                    character.remainingPoints <= 0 && styles.attributeButtonDisabled
                  ]}
                  onPress={() => handleAttributeChange(attr.key, 1)}
                  disabled={character.remainingPoints <= 0}
                >
                  <Text style={styles.attributeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Bouton de création */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!character.name.trim() || character.remainingPoints > 0) && styles.createButtonDisabled
          ]}
          onPress={handleCreateCharacter}
          disabled={!character.name.trim() || character.remainingPoints > 0}
        >
          <Text style={styles.createButtonText}>Créer le personnage</Text>
        </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  classGrid: {
    gap: 12,
  },
  classButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
  },
  classButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  classNameSelected: {
    color: Colors.primary,
  },
  classDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  attributeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsRemaining: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  attributeInfo: {
    flex: 1,
  },
  attributeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  attributeDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  attributeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  attributeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attributeButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  attributeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  attributeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});