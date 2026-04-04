// src/screens/employer/EmployerEditJobScreen.js
// BetterLink — Employer: edit an existing job listing

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { updateJob } from '../../api/jobs';
import { Button, InputField } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'internship', 'contract'];

function toDateString(val) {
  if (!val) return '';
  return val.slice(0, 10); // ISO string → YYYY-MM-DD
}

export default function EmployerEditJobScreen({ route, navigation }) {
  const { job } = route.params;

  const [form, setForm] = useState({
    title: job.title || '',
    description: job.description || '',
    location: job.location || '',
    employmentType: job.employmentType || 'full-time',
    status: job.status || 'open',
    applicationDeadline: toDateString(job.applicationDeadline),
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  }

  function handleDateChange(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length > 6) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    setField('applicationDeadline', formatted);
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

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await updateJob(job.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        employmentType: form.employmentType,
        status: form.status,
        ...(form.applicationDeadline ? { applicationDeadline: form.applicationDeadline + 'T00:00:00' } : { applicationDeadline: null }),
      });
      navigation.goBack();
    } catch (err) {
      setApiError(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {apiError ? (
          <View style={styles.apiBanner}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        ) : null}

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

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Employment Type *</Text>
            <View style={styles.typeRow}>
              {EMPLOYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, form.employmentType === type && styles.typeChipActive]}
                  onPress={() => setField('employmentType', type)}
                >
                  <Text style={[styles.typeChipText, form.employmentType === type && styles.typeChipTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Status</Text>
            <View style={styles.typeRow}>
              {['open', 'closed'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.typeChip, form.status === s && styles.typeChipActive]}
                  onPress={() => setField('status', s)}
                >
                  <Text style={[styles.typeChipText, form.status === s && styles.typeChipTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Application Deadline"
            value={form.applicationDeadline}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD (optional)"
            keyboardType="number-pad"
            autoCapitalize="none"
            error={errors.applicationDeadline}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <InputField
            label="Job Description *"
            value={form.description}
            onChangeText={(v) => setField('description', v)}
            placeholder="Describe responsibilities, requirements..."
            multiline
            numberOfLines={7}
            error={errors.description}
          />
          <Text style={styles.charCount}>{form.description.length} characters</Text>
        </View>

        <Button label="Save Changes" onPress={handleSave} loading={loading} style={styles.saveBtn} />
        <Button label="Cancel" onPress={() => navigation.goBack()} variant="outline" style={styles.cancelBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

EmployerEditJobScreen.propTypes = {
  route: PropTypes.shape({ params: PropTypes.shape({ job: PropTypes.object.isRequired }).isRequired }).isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  apiBanner: { backgroundColor: Colors.errorLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  apiErrorText: { color: Colors.error, fontSize: Typography.sm },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base,
  },
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md,
  },
  pickerWrapper: { marginBottom: Spacing.md },
  pickerLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.background,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeChipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  typeChipTextActive: { color: Colors.primary, fontWeight: Typography.semiBold },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: -Spacing.sm },
  saveBtn: { marginBottom: Spacing.sm },
  cancelBtn: {},
});
