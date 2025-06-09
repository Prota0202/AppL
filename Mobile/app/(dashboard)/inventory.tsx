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
import { useInventory } from '../../hooks/useDashboard';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { Item } from '../../src/types';

const { width } = Dimensions.get('window');

interface ItemCardProps {
  item: Item;
  onPress: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemIconContainer}>
        <Ionicons name="cube" size={32} color={Colors.primary} />
      </View>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.quantity > 1 && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>x{item.quantity}</Text>
            </View>
          )}
        </View>
        
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.itemFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.statusText}>Obtained</Text>
          </View>
          <Text style={styles.itemId}>#{item.id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ItemDetailModalProps {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, visible, onClose }) => {
  if (!item || !visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Item Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalBody}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="cube" size={64} color={Colors.primary} />
          </View>
          
          <Text style={styles.modalItemName}>{item.name}</Text>
          
          <View style={styles.modalStats}>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatLabel}>Quantity</Text>
              <Text style={styles.modalStatValue}>{item.quantity}</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatLabel}>Item ID</Text>
              <Text style={styles.modalStatValue}>#{item.id}</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatLabel}>Status</Text>
              <Text style={[styles.modalStatValue, { color: Colors.success }]}>
                Obtained
              </Text>
            </View>
          </View>
          
          {item.description && (
            <View style={styles.modalDescription}>
              <Text style={styles.modalDescriptionLabel}>Description</Text>
              <Text style={styles.modalDescriptionText}>{item.description}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function InventoryScreen() {
  const { items, loading, error, refreshInventory } = useInventory();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshInventory();
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const renderItemCard = ({ item }: { item: Item }) => (
    <ItemCard item={item} onPress={() => handleItemPress(item)} />
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Loading inventory..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        {items.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length} items</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshInventory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={items.length > 1 ? styles.row : undefined}
        contentContainerStyle={styles.itemsList}
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
              <Ionicons name="bag-outline" size={80} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Inventory is Empty</Text>
              <Text style={styles.emptyText}>
                Complete quests and defeat monsters to obtain items and rewards!
              </Text>
              <View style={styles.emptyTips}>
                <Text style={styles.emptyTipsTitle}>Tips:</Text>
                <Text style={styles.emptyTip}>• Complete quests to earn rewards</Text>
                <Text style={styles.emptyTip}>• Higher difficulty quests give better items</Text>
                <Text style={styles.emptyTip}>• Some items can be stacked</Text>
              </View>
            </View>
          ) : null
        }
      />

      <ItemDetailModal
        item={selectedItem}
        visible={modalVisible}
        onClose={handleCloseModal}
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
  itemsList: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 30,
    marginBottom: 12,
    alignSelf: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  quantityBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quantityText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  itemId: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
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
  emptyTips: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 300,
  },
  emptyTipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyTip: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    margin: 20,
    maxWidth: 350,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalDescription: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  modalDescriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    marginTop: 0,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});