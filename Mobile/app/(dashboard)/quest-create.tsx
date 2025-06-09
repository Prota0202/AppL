import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { apiService, handleApiError } from '../../src/services/apiService';

const availableItems = [
  { name: "Steel Sword", description: "A basic sword for combat" },
  { name: "Health Potion", description: "Restores HP when used" },
  { name: "Shadow Armor", description: "Armor made of shadows" },
  { name: "Monster Core", description: "A rare material from high-level monsters" },
  { name: "Magic Scroll", description: "A scroll for learning new spells" },
  { name: "Dragon Scale", description: "Scales from ancient dragons" },
  { name: "Elven Bow", description: "A bow crafted by forest elves" },
  { name: "Mystic Orb", description: "An orb containing magical energy" },
];

interface RewardItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
}

interface DifficultyOptionProps {
  option: {
    value: string;
    label: string;
    exp: string;
    color: { bg: string; text: string };
  };
  isSelected: boolean;
  onPress: () => void;
}

const DifficultyOption: React.FC<DifficultyOptionProps> = ({ option, isSelected, onPress }) => {
  const animatedValue = React.useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [option.color.bg, option.color.bg + 'CC'],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.difficultyOption,
          { backgroundColor, borderColor }
        ]}
      >
        <View style={styles.difficultyHeader}>
          <Text style={[styles.difficultyLabel, { color: option.color.text }]}>
            {option.label}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          )}
        </View>
        <Text style={[styles.difficultyExp, { color: option.color.text }]}>
          {option.exp}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface RewardItemComponentProps {
  reward: RewardItem;
  index: number;
  onUpdate: (id: string, field: keyof RewardItem, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const RewardItemComponent: React.FC<RewardItemComponentProps> = ({
  reward,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const [showItemSelector, setShowItemSelector] = useState(false);

  return (
    <View style={styles.rewardItem}>
      <View style={styles.rewardItemHeader}>
        <Text style={styles.rewardItemTitle}>Reward Item #{index + 1}</Text>
        {canRemove && (
          <TouchableOpacity
            onPress={() => onRemove(reward.id)}
            style={styles.removeRewardButton}
          >
            <Ionicons name="trash" size={16} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rewardItemContent}>
        <View style={styles.rewardInputRow}>
          <View style={styles.rewardInputFlex}>
            <Text style={styles.rewardLabel}>Item Name</Text>
            <TouchableOpacity
              style={styles.itemPickerButton}
              onPress={() => setShowItemSelector(!showItemSelector)}
            >
              <Text style={[
                styles.itemPickerText,
                reward.itemName ? styles.itemPickerTextSelected : {}
              ]}>
                {reward.itemName || 'Select an item'}
              </Text>
              <Ionicons 
                name={showItemSelector ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={Colors.textMuted} 
              />
            </TouchableOpacity>
            
            {showItemSelector && (
              <View style={styles.itemSelector}>
                {availableItems.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.itemOption,
                      reward.itemName === item.name && styles.itemOptionSelected,
                    ]}
                    onPress={() => {
                      onUpdate(reward.id, 'itemName', item.name);
                      onUpdate(reward.id, 'description', item.description);
                      setShowItemSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.itemOptionText,
                      reward.itemName === item.name && styles.itemOptionTextSelected,
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.rewardLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => onUpdate(reward.id, 'quantity', Math.max(1, reward.quantity - 1))}
              >
                <Ionicons name="remove" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{reward.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => onUpdate(reward.id, 'quantity', reward.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {reward.description && (
          <View style={styles.rewardDescription}>
            <Text style={styles.rewardDescLabel}>Description:</Text>
            <Text style={styles.rewardDescText}>{reward.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function QuestCreateScreen() {
  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    difficulty: '',
  });
  const [rewards, setRewards] = useState<RewardItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1 }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const difficultyOptions = [
    { value: 'A', label: 'A (Hardest)', exp: '1000 XP', color: Colors.difficulty.A },
    { value: 'B', label: 'B (Hard)', exp: '500 XP', color: Colors.difficulty.B },
    { value: 'C', label: 'C (Medium)', exp: '300 XP', color: Colors.difficulty.C },
    { value: 'D', label: 'D (Easy)', exp: '150 XP', color: Colors.difficulty.D },
    { value: 'E', label: 'E (Easiest)', exp: '50 XP', color: Colors.difficulty.E },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!questData.title.trim()) {
      newErrors.title = 'Quest title is required';
    } else if (questData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!questData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (questData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!questData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    const validRewards = rewards.filter(r => r.itemName.trim());
    if (validRewards.length > 0) {
      for (const reward of validRewards) {
        if (reward.quantity < 1) {
          newErrors.rewards = 'Reward quantities must be at least 1';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      
      // 🐛 DEBUG: Afficher l'état des récompenses avant filtrage
      console.log('🔍 Raw rewards state:', rewards);

      const validRewards = rewards.filter(r => r.itemName.trim()).map(r => ({
        itemName: r.itemName,
        description: r.description,
        quantity: r.quantity,
      }));

      // 🐛 DEBUG: Afficher les récompenses après filtrage
      console.log('🔍 Valid rewards after filter:', validRewards);
      console.log('🔍 Filtered out rewards:', rewards.filter(r => !r.itemName.trim()));

      const questPayload = {
      title: questData.title.trim(),
      description: questData.description.trim(),
      difficulty: questData.difficulty,
      rewards: validRewards,
    };

      // 🐛 DEBUG: Afficher le payload final
      console.log('🔍 Final quest payload:', questPayload); 

      await apiService.createQuest({
        title: questData.title.trim(),
        description: questData.description.trim(),
        difficulty: questData.difficulty,
        rewards: validRewards,
      });

      Alert.alert(
        'Success!',
        'Your quest has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addReward = () => {
    const newId = (Math.max(...rewards.map(r => parseInt(r.id))) + 1).toString();
    setRewards([...rewards, {
      id: newId,
      itemName: '',
      description: '',
      quantity: 1
    }]);
  };

  const removeReward = (id: string) => {
    if (rewards.length > 1) {
      setRewards(rewards.filter(r => r.id !== id));
    }
  };

  const updateReward = (id: string, field: keyof RewardItem, value: string | number) => {
    setRewards(rewards.map(reward => 
      reward.id === id ? { ...reward, [field]: value } : reward
    ));
  };

  const selectedDifficulty = difficultyOptions.find(d => d.value === questData.difficulty);
  const isFormValid = questData.title.trim() && 
                     questData.description.trim() && 
                     questData.difficulty && 
                     Object.keys(errors).length === 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Creating quest..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Quest</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Quest Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quest Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Quest Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={questData.title}
                onChangeText={(text) => {
                  setQuestData(prev => ({ ...prev, title: text }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="Enter quest title"
                placeholderTextColor={Colors.textMuted}
                maxLength={100}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
              <Text style={styles.helperText}>
                {questData.title.length}/100 characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                value={questData.description}
                onChangeText={(text) => {
                  setQuestData(prev => ({ ...prev, description: text }));
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Describe what the quest involves..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
              <Text style={styles.helperText}>
                {questData.description.length}/500 characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Difficulty Level <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.difficultyContainer}>
                {difficultyOptions.map((option) => (
                  <DifficultyOption
                    key={option.value}
                    option={option}
                    isSelected={questData.difficulty === option.value}
                    onPress={() => {
                      setQuestData(prev => ({ ...prev, difficulty: option.value }));
                      if (errors.difficulty) {
                        setErrors(prev => ({ ...prev, difficulty: '' }));
                      }
                    }}
                  />
                ))}
              </View>
              {errors.difficulty && (
                <Text style={styles.errorText}>{errors.difficulty}</Text>
              )}
            </View>
          </View>

          {/* Rewards Section */}
          <View style={styles.section}>
            <View style={styles.rewardHeader}>
              <Text style={styles.sectionTitle}>Reward Items (Optional)</Text>
              <TouchableOpacity style={styles.addRewardButton} onPress={addReward}>
                <Ionicons name="add" size={16} color={Colors.textPrimary} />
                <Text style={styles.addRewardText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {rewards.map((reward, index) => (
              <RewardItemComponent
                key={reward.id}
                reward={reward}
                index={index}
                onUpdate={updateReward}
                onRemove={removeReward}
                canRemove={rewards.length > 1}
              />
            ))}
            {errors.rewards && (
              <Text style={styles.errorText}>{errors.rewards}</Text>
            )}
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={[
                styles.previewHeader, 
                selectedDifficulty && { backgroundColor: selectedDifficulty.color.bg }
              ]} />
              <View style={styles.previewContent}>
                <View style={styles.previewTitleRow}>
                  <Text style={styles.previewTitle}>
                    {questData.title || 'Quest Title'}
                  </Text>
                  {selectedDifficulty && (
                    <View style={[
                      styles.previewDifficulty,
                      { backgroundColor: selectedDifficulty.color.bg }
                    ]}>
                      <Text style={[
                        styles.previewDifficultyText,
                        { color: selectedDifficulty.color.text }
                      ]}>
                        Rank {selectedDifficulty.value}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.previewDescription}>
                  {questData.description || 'Quest description will appear here...'}
                </Text>
                <View style={styles.previewReward}>
                  <Ionicons name="gift" size={16} color={Colors.warning} />
                  <Text style={styles.previewRewardText}>
                    {selectedDifficulty?.exp || '0 XP'}
                    {rewards.filter(r => r.itemName).map(r => ` + x${r.quantity} ${r.itemName}`).join('')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
          <Text style={styles.submitButtonText}>Create Quest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  difficultyContainer: {
    gap: 8,
  },
  difficultyOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyExp: {
    fontSize: 12,
    opacity: 0.8,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addRewardText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rewardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  removeRewardButton: {
    padding: 4,
  },
  rewardItemContent: {
    gap: 12,
  },
  rewardInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardInputFlex: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  itemPickerButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPickerText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  itemPickerTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  itemSelector: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200,
  },
  itemOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemOptionSelected: {
    backgroundColor: Colors.primary + '20',
  },
  itemOptionText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  itemOptionTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  quantityContainer: {
    width: 80,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  quantityValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  rewardDescription: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    padding: 8,
  },
  rewardDescLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  rewardDescText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewHeader: {
    height: 4,
    backgroundColor: Colors.border,
  },
  previewContent: {
    padding: 16,
  },
  previewTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  previewDifficulty: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  previewDifficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  previewReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  previewRewardText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});