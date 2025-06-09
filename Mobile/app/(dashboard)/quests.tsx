import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInventory } from '../../hooks/useDashboard'; // Import du hook d'inventaire
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { apiService, handleApiError } from '../../src/services/apiService';
import { Quest, QuestStatus } from '../../src/types';

const { width, height } = Dimensions.get('window');

interface QuestTabProps {
  label: string;
  value: QuestStatus;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

const QuestTab: React.FC<QuestTabProps> = ({ label, count, isActive, onPress }) => {
  const animatedValue = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surface, Colors.primary],
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.textMuted, Colors.textPrimary],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.tab, { backgroundColor }]}>
        <Animated.Text style={[styles.tabText, { color: textColor }]}>
          {label}
        </Animated.Text>
        <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
          <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
            {count}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface QuestCardProps {
  quest: Quest;
  onAction: (questId: number, action: string) => void;
  isUpdating?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onAction, isUpdating }) => {
  const [localProgress, setLocalProgress] = useState(quest.progress);
  const animatedProgress = React.useRef(new Animated.Value(quest.progress)).current;

  React.useEffect(() => {
    setLocalProgress(quest.progress);
    Animated.timing(animatedProgress, {
      toValue: quest.progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [quest.progress, animatedProgress]);

  const getDifficultyColor = (difficulty: string) => {
    return Colors.difficulty[difficulty as keyof typeof Colors.difficulty] || Colors.difficulty.E;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const difficultyColors = getDifficultyColor(quest.difficulty);

  const handleAction = (action: string) => {
    if (action === 'cancel') {
      Alert.alert(
        'Cancel Quest',
        'Are you sure you want to cancel this quest? This action cannot be undone.',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: () => onAction(quest.id, action) },
        ]
      );
    } else {
      onAction(quest.id, action);
    }
  };

  return (
    <View style={styles.questCard}>
      <View style={[styles.questHeader, { backgroundColor: difficultyColors.bg }]} />
      
      <View style={styles.questContent}>
        <View style={styles.questTitleRow}>
          <Text style={styles.questTitle} numberOfLines={2}>
            {quest.title}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
            <Text style={[styles.difficultyText, { color: difficultyColors.text }]}>
              Rank {quest.difficulty}
            </Text>
          </View>
        </View>

        {quest.description && (
          <Text style={styles.questDescription} numberOfLines={3}>
            {quest.description}
          </Text>
        )}

        {quest.status === 'IN_PROGRESS' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(localProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: animatedProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    })
                  }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.questMeta}>
          <View style={styles.rewardContainer}>
            <Ionicons name="gift" size={16} color={Colors.warning} />
            <Text style={styles.rewardText}>{quest.reward}</Text>
          </View>

          {quest.completedDate && (
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.statusText}>Completed {formatDate(quest.completedDate)}</Text>
            </View>
          )}

          {quest.failedDate && (
            <View style={styles.statusContainer}>
              <Ionicons name="close-circle" size={14} color={Colors.error} />
              <Text style={styles.statusText}>Failed {formatDate(quest.failedDate)}</Text>
            </View>
          )}
        </View>

        {quest.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason for Failure:</Text>
            <Text style={styles.reasonText}>{quest.reason}</Text>
          </View>
        )}

        <View style={styles.questActions}>
          {quest.status === 'AVAILABLE' && (
            <TouchableOpacity
              style={[styles.acceptButton, isUpdating && styles.buttonDisabled]}
              onPress={() => handleAction('accept')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LoadingSpinner size="small" showMessage={false} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
                  <Text style={styles.acceptButtonText}>Accept Quest</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {quest.status === 'IN_PROGRESS' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.progressButton, isUpdating && styles.buttonDisabled]}
                onPress={() => handleAction('progress')}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <LoadingSpinner size="small" showMessage={false} />
                ) : (
                  <>
                    <Ionicons name="arrow-forward" size={14} color={Colors.textPrimary} />
                    <Text style={styles.progressButtonText}>Update Progress</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, isUpdating && styles.buttonDisabled]}
                onPress={() => handleAction('cancel')}
                disabled={isUpdating}
              >
                <Ionicons name="close" size={14} color={Colors.textPrimary} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<QuestStatus>('AVAILABLE');
  const [quests, setQuests] = useState<Record<QuestStatus, Quest[]>>({
    AVAILABLE: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    FAILED: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingQuests, setUpdatingQuests] = useState<Set<number>>(new Set());

  // ✅ Ajout du hook d'inventaire
  const { refreshInventory } = useInventory();

  const questTabs = [
    { label: 'Available', value: 'AVAILABLE' as QuestStatus },
    { label: 'In Progress', value: 'IN_PROGRESS' as QuestStatus },
    { label: 'Completed', value: 'COMPLETED' as QuestStatus },
    { label: 'Failed', value: 'FAILED' as QuestStatus },
  ];

  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🎯 Loading quests...');
      
      const data = await apiService.getQuests();
      console.log('✅ Quests loaded:', data);
      setQuests(data);
    } catch (error) {
      console.error('❌ Error loading quests:', error);
      const errorMessage = handleApiError(error);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuests();
    }, [loadQuests])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadQuests(),
        refreshInventory() // ✅ Rafraîchir aussi l'inventaire lors du pull-to-refresh
      ]);
    } catch (error) {
      console.error('Error refreshing quests:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadQuests, refreshInventory]);

  const handleQuestAction = async (questId: number, action: string) => {
  try {
    setUpdatingQuests(prev => new Set(prev).add(questId));
    
    console.log('🎯 Quest action:', { questId, action });
    
    const result = await apiService.updateQuest(questId, action as 'accept' | 'progress' | 'cancel');
    
    console.log('✅ Quest action result:', result);
    
    let successMessage = '';
    let shouldRefreshInventory = false;
    
    switch (action) {
      case 'accept':
        successMessage = 'Quest accepted successfully!';
        break;
      case 'progress':
        // Vérifier si la quête a été complétée (100% de progression)
        if (result && (result.progress >= 100 || result.status === 'COMPLETED')) {
          successMessage = `Quest completed! 🎉\n\nRewards received:\n• ${result.reward || 'XP reward'}`;
          shouldRefreshInventory = true;
          console.log('🎁 Quest completed, should refresh inventory');
        } else {
          successMessage = 'Progress updated successfully!';
        }
        break;
      case 'cancel':
        successMessage = 'Quest cancelled';
        break;
    }
    
    Alert.alert('Success!', successMessage);
    
    // Rafraîchir les quêtes immédiatement
    await loadQuests();
    
    // Si la quête est complétée, attendre un peu puis rafraîchir l'inventaire
    if (shouldRefreshInventory) {
      console.log('⏳ Waiting 2 seconds before refreshing inventory...');
      
      // Attendre 2 secondes pour laisser le temps au backend de traiter les récompenses
      setTimeout(async () => {
        console.log('🔄 Refreshing inventory after quest completion...');
        try {
          await refreshInventory();
          console.log('✅ Inventory refreshed successfully');
          
          // Optionnel : afficher un toast pour confirmer les récompenses
          Alert.alert(
            'Rewards Added! 🎁', 
            'Check your inventory for the new items!',
            [{ text: 'Open Inventory', onPress: () => router.push('/(dashboard)/inventory') }]
          );
        } catch (error) {
          console.error('❌ Failed to refresh inventory:', error);
        }
      }, 2000);
    } else {
      // Rafraîchir l'inventaire normalement pour les autres actions
      await refreshInventory();
    }
    
  } catch (error) {
    const errorMessage = handleApiError(error);
    Alert.alert('Error', errorMessage);
    console.error('❌ Quest action failed:', error);
  } finally {
    setUpdatingQuests(prev => {
      const newSet = new Set(prev);
      newSet.delete(questId);
      return newSet;
    });
  }
};

  const renderQuestItem = ({ item }: { item: Quest }) => (
    <QuestCard 
      quest={item} 
      onAction={handleQuestAction}
      isUpdating={updatingQuests.has(item.id)}
    />
  );

  if (loading && Object.values(quests).every(arr => arr.length === 0)) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner size="large" message="Loading quests..." />
        <Text style={styles.debugText}>
          API URL: {apiService.debugBaseUrl}
        </Text>
        <Text style={styles.debugText}>
          Platform: {Platform.OS}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Quest Board</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(dashboard)/quest-create')}
        >
          <Ionicons name="add" size={20} color={Colors.textPrimary} />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={questTabs}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <QuestTab
              label={item.label}
              value={item.value}
              count={quests[item.value].length}
              isActive={activeTab === item.value}
              onPress={() => setActiveTab(item.value)}
            />
          )}
          contentContainerStyle={styles.tabRow}
        />
      </View>

      <FlatList
        data={quests[activeTab]}
        renderItem={renderQuestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.questList,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Quests</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'AVAILABLE' ? 
                  'No quests available right now. Create a new quest to get started!' :
                  `No quests in the ${activeTab.toLowerCase().replace('_', ' ')} category.`
                }
              </Text>
              {activeTab === 'AVAILABLE' && (
                <TouchableOpacity
                  style={styles.emptyCreateButton}
                  onPress={() => router.push('/(dashboard)/quest-create')}
                >
                  <Ionicons name="add" size={16} color={Colors.textPrimary} />
                  <Text style={styles.emptyCreateButtonText}>Create Your First Quest</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
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
    padding: 20,
  },
  debugText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: width < 400 ? 20 : 24, // Responsive font size
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  tabRow: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width < 400 ? 12 : 16, // Responsive padding
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: width < 400 ? 100 : 120, // Responsive min width
  },
  tabText: {
    fontSize: width < 400 ? 12 : 14, // Responsive font size
    fontWeight: '600',
    marginRight: 8,
  },
  tabBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: Colors.primaryDark,
  },
  tabBadgeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBadgeTextActive: {
    color: Colors.primaryLight,
  },
  questList: {
    padding: 16,
  },
  questCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questHeader: {
    height: 4,
  },
  questContent: {
    padding: width < 400 ? 16 : 20, // Responsive padding
  },
  questTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitle: {
    fontSize: width < 400 ? 16 : 18, // Responsive font size
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  questDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  questMeta: {
    marginBottom: 16,
    gap: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  rewardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  reasonContainer: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.error,
    opacity: 0.8,
  },
  questActions: {
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  acceptButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  progressButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
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
  emptyCreateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyCreateButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
});