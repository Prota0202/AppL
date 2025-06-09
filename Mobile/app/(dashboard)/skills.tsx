import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useSkills } from '../../hooks/useDashboard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { Skill } from '../../src/types';

const { width } = Dimensions.get('window');

interface SkillCardProps {
  skill: Skill;
  onPress: () => void;
  isSelected?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onPress, isSelected }) => {
  const progress = (skill.level / skill.maxLevel) * 100;

  return (
    <TouchableOpacity
      style={[styles.skillCard, isSelected && styles.skillCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.skillHeader}>
        <View style={styles.skillTitleContainer}>
          <Text style={styles.skillName} numberOfLines={1}>
            {skill.name}
          </Text>
          <View style={styles.skillLevelBadge}>
            <Text style={styles.skillLevelText}>
              Lvl {skill.level}/{skill.maxLevel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <Text style={styles.skillDescription} numberOfLines={2}>
        {skill.description}
      </Text>
    </TouchableOpacity>
  );
};

interface SkillDetailModalProps {
  skill: Skill | null;
  visible: boolean;
  onClose: () => void;
  onUpgrade: (skillId: number) => Promise<void>;
  onRemove: (skillId: number) => Promise<void>;
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  visible,
  onClose,
  onUpgrade,
  onRemove,
}) => {
  const [loading, setLoading] = useState(false);

  if (!skill) return null;

  const progress = (skill.level / skill.maxLevel) * 100;
  const isMaxLevel = skill.level >= skill.maxLevel;

  const handleUpgrade = async () => {
    if (isMaxLevel) return;

    Alert.alert(
      'Upgrade Skill',
      `Upgrade ${skill.name} to level ${skill.level + 1}?\n\nThis will cost experience points.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              setLoading(true);
              await onUpgrade(skill.id);
              Alert.alert('Success!', `${skill.name} has been upgraded!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to upgrade skill');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemove = async () => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove ${skill.name}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onRemove(skill.id);
              onClose();
              Alert.alert('Removed', `${skill.name} has been removed`);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove skill');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Skill Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.skillDetailCard}>
            <Text style={styles.skillDetailName}>{skill.name}</Text>
            
            <View style={styles.skillStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current Level</Text>
                <Text style={styles.statValue}>{skill.level}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Max Level</Text>
                <Text style={styles.statValue}>{skill.maxLevel}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Skill ID</Text>
                <Text style={styles.statValue}>#{skill.id}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.modalProgressBar}>
                <View
                  style={[styles.modalProgressFill, { width: `${progress}%` }]}
                />
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.skillDetailDescription}>
                {skill.description}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                (isMaxLevel || loading) && styles.buttonDisabled,
              ]}
              onPress={handleUpgrade}
              disabled={isMaxLevel || loading}
            >
              <Text style={styles.upgradeButtonText}>
                {isMaxLevel ? 'Max Level' : 'Upgrade Skill'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeButton, loading && styles.buttonDisabled]}
              onPress={handleRemove}
              disabled={loading}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <LoadingSpinner size="medium" message="Processing..." />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function SkillsScreen() {
  const { skills, loading, error, refreshSkills, upgradeSkill, removeSkill } = useSkills();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSkills();
    } catch (error) {
      console.error('Error refreshing skills:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSkillPress = (skill: Skill) => {
    setSelectedSkill(skill);
    setModalVisible(true);
  };

  const handleUpgrade = async (skillId: number) => {
    await upgradeSkill(skillId);
    await refreshSkills(); // Refresh to get updated data
  };

  const handleRemove = async (skillId: number) => {
    await removeSkill(skillId);
    await refreshSkills(); // Refresh to get updated data
  };

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <SkillCard
      skill={item}
      onPress={() => handleSkillPress(item)}
      isSelected={selectedSkill?.id === item.id}
    />
  );

  if (loading && skills.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading skills..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(dashboard)/skill-create')}
        >
          <Ionicons name="add" size={20} color={Colors.textPrimary} />
          <Text style={styles.addButtonText}>Add Skill</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshSkills}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.skillsContainer}>
        <View style={styles.skillsHeader}>
          <Text style={styles.sectionTitle}>Skill List</Text>
          {skills.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>Total: {skills.length} skills</Text>
            </View>
          )}
        </View>

        <FlatList
          data={skills}
          renderItem={renderSkillItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.skillsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="flash-off" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Skills Yet</Text>
              <Text style={styles.emptyText}>
                You don&apos;t have any skills. Tap the &quot;Add Skill&quot; button to create your first skill!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(dashboard)/skill-create')}
              >
                <Text style={styles.emptyButtonText}>Add Your First Skill</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <SkillDetailModal
        skill={selectedSkill}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedSkill(null);
        }}
        onUpgrade={handleUpgrade}
        onRemove={handleRemove}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  skillsContainer: {
    flex: 1,
    padding: 16,
  },
  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  skillsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  skillCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: (width - 48) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillCardSelected: {
    borderColor: Colors.primary,
  },
  skillHeader: {
    marginBottom: 12,
  },
  skillTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  skillLevelBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillLevelText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  skillDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  skillDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  skillDetailName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  skillStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalProgressBar: {
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  skillDetailDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});