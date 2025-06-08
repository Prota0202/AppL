import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { apiService, handleApiError } from '../../src/services/apiService';

export default function SkillCreateScreen() {
  const [skillData, setSkillData] = useState({
    name: '',
    description: '',
    maxLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!skillData.name.trim()) {
      newErrors.name = 'Skill name is required';
    } else if (skillData.name.trim().length < 3) {
      newErrors.name = 'Skill name must be at least 3 characters';
    }

    if (!skillData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (skillData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const maxLevel = parseInt(skillData.maxLevel);
    if (!skillData.maxLevel) {
      newErrors.maxLevel = 'Max level is required';
    } else if (isNaN(maxLevel) || maxLevel < 2) {
      newErrors.maxLevel = 'Max level must be at least 2';
    } else if (maxLevel > 100) {
      newErrors.maxLevel = 'Max level cannot exceed 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await apiService.createSkill({
        name: skillData.name.trim(),
        description: skillData.description.trim(),
        maxLevel: parseInt(skillData.maxLevel),
      });

      Alert.alert(
        'Success!',
        'Your new skill has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
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

  const isFormValid = skillData.name.trim() && 
                     skillData.description.trim() && 
                     skillData.maxLevel && 
                     Object.keys(errors).length === 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Creating skill..." />
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
        <Text style={styles.title}>Add New Skill</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Create a new skill to track your progress and abilities
          </Text>

          {/* Skill Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Skill Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={skillData.name}
              onChangeText={(text) => {
                setSkillData(prev => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Enter skill name (e.g., Shadow Extraction)"
              placeholderTextColor={Colors.textMuted}
              maxLength={50}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
            <Text style={styles.helperText}>
              Choose a descriptive name for your skill
            </Text>
          </View>

          {/* Description */}
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
              value={skillData.description}
              onChangeText={(text) => {
                setSkillData(prev => ({ ...prev, description: text }));
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Describe what this skill does and its effects..."
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
              {skillData.description.length}/500 characters
            </Text>
          </View>

          {/* Max Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Max Level <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.maxLevel && styles.inputError]}
              value={skillData.maxLevel}
              onChangeText={(text) => {
                // Only allow numbers
                const numericValue = text.replace(/[^0-9]/g, '');
                setSkillData(prev => ({ ...prev, maxLevel: numericValue }));
                if (errors.maxLevel) {
                  setErrors(prev => ({ ...prev, maxLevel: '' }));
                }
              }}
              placeholder="Enter maximum level (2-100)"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.maxLevel && (
              <Text style={styles.errorText}>{errors.maxLevel}</Text>
            )}
            <Text style={styles.helperText}>
              Set the maximum level this skill can reach (2-100)
            </Text>
          </View>

          {/* Preview Card */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewSkillName}>
                  {skillData.name || 'Skill Name'}
                </Text>
                <View style={styles.previewLevelBadge}>
                  <Text style={styles.previewLevelText}>
                    Lvl 1/{skillData.maxLevel || 'X'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.previewProgressBar}>
                <View style={styles.previewProgressFill} />
              </View>
              
              <Text style={styles.previewDescription}>
                {skillData.description || 'Skill description will appear here...'}
              </Text>
            </View>
          </View>

          {/* Requirements Info */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>Name: 3-50 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>Description: 10-500 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>Max Level: 2-100</Text>
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
          <Text style={styles.submitButtonText}>Create Skill</Text>
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
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewSkillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  previewLevelBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewLevelText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewProgressBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    width: '10%', // Starting level
  },
  previewDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  requirementsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.textMuted,
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