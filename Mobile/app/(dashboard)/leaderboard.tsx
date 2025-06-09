import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { LeaderboardUser } from '../../src/types';

const { width } = Dimensions.get('window');

interface LeaderboardItemProps {
  player: LeaderboardUser;
  currentUserId: number;
}

const getClassIcon = (characterClass: string) => {
  switch (characterClass) {
    case 'WARRIOR':
      return 'shield';
    case 'MAGE':
      return 'flash';
    case 'ROGUE':
      return 'eye';
    default:
      return 'person';
  }
};

const getClassColor = (characterClass: string) => {
  switch (characterClass) {
    case 'WARRIOR':
      return Colors.warrior;
    case 'MAGE':
      return Colors.mage;
    case 'ROGUE':
      return Colors.rogue;
    default:
      return { bg: Colors.surface, text: Colors.textSecondary };
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return styles.goldRank;
    case 2:
      return styles.silverRank;
    case 3:
      return styles.bronzeRank;
    default:
      return styles.defaultRank;
  }
};

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ player, currentUserId }) => {
  const classColors = getClassColor(player.class);
  const rankIcon = getRankIcon(player.rank);
  const isCurrentUser = player.id === currentUserId;

  return (
    <View style={[
      styles.playerCard,
      isCurrentUser && styles.currentUserCard,
      player.rank <= 3 && styles.topThreeCard
    ]}>
      {/* Rank Section */}
      <View style={styles.rankSection}>
        <View style={[styles.rankBadge, getRankStyle(player.rank)]}>
          {rankIcon ? (
            <Text style={styles.rankIcon}>{rankIcon}</Text>
          ) : (
            <Text style={styles.rankNumber}>#{player.rank}</Text>
          )}
        </View>
      </View>

      {/* Player Info Section */}
      <View style={styles.playerInfo}>
        <View style={styles.playerHeader}>
          <View style={styles.nameSection}>
            <Text style={[styles.characterName, isCurrentUser && styles.currentUserText]} numberOfLines={1}>
              {player.characterName}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {player.level}</Text>
          </View>
        </View>

        <View style={styles.playerDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            by {player.userName}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.statText}>{player.experience.toLocaleString()} XP</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
              <Text style={styles.statText}>{player.totalCompletedQuests} quests</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Class Section */}
      <View style={styles.classSection}>
        <View style={[styles.classIcon, { backgroundColor: classColors.bg }]}>
          <Ionicons 
            name={getClassIcon(player.class) as any} 
            size={20} 
            color={classColors.text} 
          />
        </View>
        <Text style={[styles.classText, { color: classColors.text }]}>
          {player.class.toLowerCase()}
        </Text>
      </View>
    </View>
  );
};

interface UserStatsCardProps {
  user: LeaderboardUser;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ user }) => {
  return (
    <View style={styles.userStatsCard}>
      <Text style={styles.userStatsTitle}>Your Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Rank</Text>
          <View style={styles.statValueContainer}>
            <Text style={styles.statValue}>#{user.rank}</Text>
            {user.rank <= 3 && (
              <Text style={styles.statEmoji}>{getRankIcon(user.rank)}</Text>
            )}
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{user.experience.toLocaleString()}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completed Quests</Text>
          <Text style={styles.statValue}>{user.totalCompletedQuests}</Text>
        </View>
      </View>
    </View>
  );
};

export default function LeaderboardScreen() {
  const { leaderboardData, loading, error, refreshLeaderboard } = useLeaderboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLeaderboard();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => (
    <LeaderboardItem 
      player={item} 
      currentUserId={leaderboardData?.user?.id || 0}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Ionicons name="trophy" size={32} color={Colors.warning} />
        <Text style={styles.title}>Hunter Rankings</Text>
      </View>
      <Text style={styles.subtitle}>
        See how you rank against other hunters worldwide
      </Text>
      
      {leaderboardData?.user && (
        <UserStatsCard user={leaderboardData.user} />
      )}
      
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Top Hunters</Text>
        {leaderboardData?.leaderboard && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{leaderboardData.leaderboard.length} hunters</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && !leaderboardData) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading rankings..." />
      </View>
    );
  }

  if (error && !leaderboardData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Failed to Load Rankings</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshLeaderboard}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Ranking</Text>
      </View>

      <FlatList
        data={leaderboardData?.leaderboard || []}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Rankings Available</Text>
              <Text style={styles.emptyText}>
                Be the first to complete quests and climb the rankings!
              </Text>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  listContainer: {
    paddingBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  userStatsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  userStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statEmoji: {
    fontSize: 16,
    marginLeft: 4,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
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
  playerCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentUserCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  topThreeCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rankSection: {
    marginRight: 16,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldRank: {
    backgroundColor: '#FFD700',
  },
  silverRank: {
    backgroundColor: '#C0C0C0',
  },
  bronzeRank: {
    backgroundColor: '#CD7F32',
  },
  defaultRank: {
    backgroundColor: Colors.surfaceLight,
  },
  rankIcon: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  currentUserText: {
    color: Colors.primary,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  classSection: {
    alignItems: 'center',
    gap: 4,
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
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
  },
});