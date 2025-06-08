import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { fakeQuests, simulateApiDelay } from '../../src/services/fakeData';
import { Quest, QuestStatus } from '../../src/types';

const { width } = Dimensions.get('window');

interface QuestTabProps {
  label: string;
  value: QuestStatus;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

const QuestTab: React.FC<QuestTabProps> = ({ label, count, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.tabActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {label}
    </Text>
    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
      <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

interface QuestCardProps {
  quest: Quest;
  onAction: (questId: number, action: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onAction }) => {
  const getDifficultyColor = (difficulty: string) => {
    return Colors.difficulty[difficulty as keyof typeof Colors.difficulty] || Colors.difficulty.E;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const difficultyColors = getDifficultyColor(quest.difficulty);

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
              <Text style={styles.progressPercent}>{quest.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${quest.progress}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.questMeta}>
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>Reward:</Text>
            <Text style={styles.rewardText}>{quest.reward}</Text>
          </View>

          {quest.completedDate && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Completed:</Text>
              <Text style={styles.statusText}>{formatDate(quest.completedDate)}</Text>
            </View>
          )}

          {quest.failedDate && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Failed:</Text>
              <Text style={styles.statusText}>{formatDate(quest.failedDate)}</Text>
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
              style={styles.acceptButton}
              onPress={() => onAction(quest.id, 'accept')}
            >
              <Text style={styles.acceptButtonText}>Accept Quest</Text>
            </TouchableOpacity>
          )}

          {quest.status === 'IN_PROGRESS' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.progressButton}
                onPress={() => onAction(quest.id, 'progress')}
              >
                <Text style={styles.progressButtonText}>Update Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => onAction(quest.id, 'cancel')}
              >
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
  const [activeTab, setActiveTab] = useState<QuestStatus>('AVAILABLE');
  const [quests, setQuests] = useState<Record<QuestStatus, Quest[]>>({
    AVAILABLE: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    FAILED: [],
  });
  const [loading, setLoading] = useState(true);

  const questTabs = [
    { label: 'Available', value: 'AVAILABLE' as QuestStatus },
    { label: 'In Progress', value: 'IN_PROGRESS' as QuestStatus },
    { label: 'Completed', value: 'COMPLETED' as QuestStatus },
    { label: 'Failed', value: 'FAILED' as QuestStatus },
  ];

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(1000);
      setQuests(fakeQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
      Alert.alert('Error', 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestAction = async (questId: number, action: string) => {
    try {
      await simulateApiDelay(500);

      if (action === 'accept') {
        Alert.alert('Success!', 'Quest accepted successfully!');
      } else if (action === 'progress') {
        Alert.alert('Success!', 'Progress updated successfully!');
      } else if (action === 'cancel') {
        Alert.alert(
          'Confirm',
          'Are you sure you want to cancel this quest?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                Alert.alert('Quest Cancelled', 'The quest has been cancelled.');
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Action failed. Please try again.');
    }
  };

  const renderQuestItem = ({ item }: { item: Quest }) => (
    <QuestCard quest={item} onAction={handleQuestAction} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading quests..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Quest</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {questTabs.map((tab) => (
              <QuestTab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                count={quests[tab.value].length}
                isActive={activeTab === tab.value}
                onPress={() => setActiveTab(tab.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={quests[activeTab]}
        renderItem={renderQuestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.questList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              No quests currently in this category.
            </Text>
          </View>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 120,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  tabTextActive: {
    color: Colors.textPrimary,
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
    backgroundColor: '#1E3A8A',
  },
  tabBadgeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBadgeTextActive: {
    color: '#93C5FD',
  },
  questList: {
    padding: 16,
  },
  questCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  questHeader: {
    height: 4,
  },
  questContent: {
    padding: 20,
  },
  questTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
  },
  progressPercent: {
    fontSize: 12,
    color: Colors.textMuted,
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
  },
  rewardContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reasonContainer: {
    backgroundColor: '#7C2D12',
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
    color: '#FCA5A5',
  },
  questActions: {
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
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
  },
  progressButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});