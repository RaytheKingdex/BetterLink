// src/screens/employer/PostJobScreen.js
// BetterLink — Post a Job (Employer only)

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { createJob } from '../../api/jobs';
import { Button, InputField } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'internship', 'contract'];

export default function PostJobScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    employmentType: 'full-time',
    applicationDeadline: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    else if (form.description.trim().length < 30) errs.description = 'Description must be at least 30 characters.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (form.applicationDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(form.applicationDeadline)) {
      errs.applicationDeadline = 'Enter a valid date (YYYY-MM-DD).';
    }
    return errs;
  }

  async function handlePost() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        employmentType: form.employmentType,
        ...(form.applicationDeadline ? { applicationDeadline: form.applicationDeadline } : {}),
      };
      await createJob(payload);
      Alert.alert(
        'Job Posted! 🎉',
        'Your job listing is now live and visible to students.',
        [{ text: 'Great!', onPress: () => navigation.navigate('Jobs') }]
      );
      setForm({ title: '', description: '', location: '', employmentType: 'full-time', applicationDeadline: '' });
    } catch (err) {
      setApiError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Post a Job</Text>
          <Text style={styles.subHeading}>
            Reach qualified Jamaican university students and graduates.
          </Text>
        </View>

        {apiError ? (
          <View style={styles.apiBanner}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Job Details</Text>
          <InputField
            label="Job Title *"
            value={form.title}
            onChangeText={(v) => setField('title', v)}
            placeholder="e.g. Junior Software Developer"
            autoCapitalize="words"
            error={errors.title}
          />
          <InputField
            label="Location *"
            value={form.location}
            onChangeText={(v) => setField('location', v)}
            placeholder="e.g. Kingston, Jamaica or Remote"
            autoCapitalize="words"
            error={errors.location}
          />

          {/* Employment Type Picker */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Employment Type *</Text>
            <View style={styles.typeRow}>
              {EMPLOYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    form.employmentType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setField('employmentType', type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      form.employmentType === type && styles.typeChipTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Application Deadline"
            value={form.applicationDeadline}
            onChangeText={(v) => setField('applicationDeadline', v)}
            placeholder="YYYY-MM-DD (optional)"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            error={errors.applicationDeadline}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <InputField
            label="Job Description *"
            value={form.description}
            onChangeText={(v) => setField('description', v)}
            placeholder="Describe responsibilities, requirements, and what you're looking for in a candidate..."
            multiline
            numberOfLines={7}
            error={errors.description}
          />
          <Text style={styles.charCount}>{form.description.length} characters</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsHeading}>💡 Posting Tips</Text>
          <Text style={styles.tipText}>• Be specific about required skills and qualifications</Text>
          <Text style={styles.tipText}>• Mention salary range or stipend if applicable</Text>
          <Text style={styles.tipText}>• Include details about your team and culture</Text>
          <Text style={styles.tipText}>• Clearly state application instructions</Text>
        </View>

        <Button
          label="Post Job Listing"
          onPress={handlePost}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

PostJobScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing['2xl'], paddingBottom: Spacing['4xl'] },
  header: { marginBottom: Spacing.xl },
  heading: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  subHeading: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22 },
  apiBanner: { backgroundColor: Colors.errorLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  apiErrorText: { color: Colors.error, fontSize: Typography.sm },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md,
  },
  pickerWrapper: { marginBottom: Spacing.md },
  pickerLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeChipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  typeChipTextActive: { color: Colors.primary, fontWeight: Typography.semiBold },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: -Spacing.sm },
  tipsCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    marginBottom: Spacing.base,
    gap: Spacing.xs,
  },
  tipsHeading: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.accent, marginBottom: Spacing.sm },
  tipText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  submitBtn: { marginTop: Spacing.sm },
});
