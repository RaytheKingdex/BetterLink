// src/screens/student/JobDetailScreen.js
// BetterLink — Job Detail + Apply

import React, { useCallback, useEffect, useState } from 'react';
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
import { getJobById, applyToJob } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, FullScreenLoader, ErrorBanner, InputField } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPLOYMENT_TAG_COLORS = {
  'full-time': { color: Colors.fullTime, bg: Colors.fullTimeLight },
  'part-time': { color: Colors.partTime, bg: Colors.partTimeLight },
  internship: { color: Colors.internship, bg: Colors.internshipLight },
  contract: { color: Colors.contract, bg: Colors.contractLight },
};

function getTagColors(type) {
  const key = (type || '').toLowerCase();
  return EMPLOYMENT_TAG_COLORS[key] || { color: Colors.textSecondary, bg: Colors.borderLight };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-JM', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}
InfoRow.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { isAuthenticated, isStudent } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application modal state
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applied, setApplied] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobById(jobId);
      setJob(data);
    } catch (err) {
      setError(err.message || 'Could not load job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  async function handleApply() {
    setApplying(true);
    setApplyError('');
    try {
      await applyToJob(jobId, { coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      Alert.alert('Applied! 🎉', 'Your application has been submitted successfully.', [{ text: 'OK' }]);
    } catch (err) {
      if (err.status === 409) {
        setApplied(true);
        setShowApplyForm(false);
        Alert.alert('Already Applied', 'You have already applied to this job.');
      } else {
        setApplyError(err.message || 'Failed to submit application.');
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <FullScreenLoader message="Loading job details..." />;

  if (error) {
    return (
      <View style={styles.flex}>
        <ErrorBanner message={error} onRetry={fetchJob} />
      </View>
    );
  }

  if (!job) return null;

  const tag = getTagColors(job.employmentType);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.employerRow}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerAvatarText}>
                {(job.employerName || '?')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>{job.employerName}</Text>
              <Text style={styles.jobLocation}>{job.location || 'Remote / TBD'}</Text>
            </View>
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.tagRow}>
            <Badge
              label={job.employmentType || 'Open'}
              color={tag.color}
              bgColor={tag.bg}
            />
            {job.status && (
              <Badge
                label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                color={Colors.success}
                bgColor={Colors.successLight}
              />
            )}
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.infoCard}>
          <InfoRow icon="📅" label="Posted" value={formatDate(job.postedDate)} />
          <InfoRow icon="📍" label="Location" value={job.location} />
          <InfoRow icon="💼" label="Type" value={job.employmentType} />
        </View>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descHeading}>Job Description</Text>
          <Text style={styles.descText}>{job.description}</Text>
        </View>

        {/* Apply Form */}
        {showApplyForm && (
          <View style={styles.applyCard}>
            <Text style={styles.applyHeading}>Your Application</Text>
            <InputField
              label="Cover Letter (optional)"
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="Tell the employer why you're a great fit..."
              multiline
              numberOfLines={5}
            />
            {applyError ? (
              <Text style={styles.applyError}>{applyError}</Text>
            ) : null}
            <View style={styles.applyActions}>
              <Button
                label="Cancel"
                onPress={() => { setShowApplyForm(false); setApplyError(''); }}
                variant="outline"
                style={styles.applyActionBtn}
              />
              <Button
                label="Submit Application"
                onPress={handleApply}
                loading={applying}
                style={styles.applyActionBtn}
              />
            </View>
          </View>
        )}

        {/* CTA */}
        {!showApplyForm && (
          <View style={styles.ctaContainer}>
            {!isAuthenticated && (
              <View>
                <Button
                  label="Sign In to Apply"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.ctaBtn}
                />
                <Text style={styles.ctaHint}>You must be signed in as a student to apply.</Text>
              </View>
            )}
            {isAuthenticated && !isStudent && (
              <View style={styles.employerNotice}>
                <Text style={styles.employerNoticeText}>
                  Only students can apply to jobs. Switch to a student account to apply.
                </Text>
              </View>
            )}
            {isAuthenticated && isStudent && !applied && (
              <Button
                label="Apply for this Job →"
                onPress={() => setShowApplyForm(true)}
                style={styles.ctaBtn}
              />
            )}
            {applied && (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedText}>✅ Application Submitted</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

JobDetailScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({ jobId: PropTypes.number.isRequired }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },

  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  employerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  employerAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  employerAvatarText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  employerInfo: { flex: 1 },
  employerName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  jobLocation: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },
  jobTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md, lineHeight: 30 },
  tagRow: { flexDirection: 'row', gap: Spacing.sm },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  infoIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  infoLabel: { fontSize: Typography.xs, color: Colors.textTertiary, fontWeight: Typography.medium, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium, marginTop: 2 },

  descCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  descHeading: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  descText: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 24 },

  applyCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  applyHeading: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.primary, marginBottom: Spacing.md },
  applyError: { color: Colors.error, fontSize: Typography.sm, marginBottom: Spacing.sm },
  applyActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  applyActionBtn: { flex: 1 },

  ctaContainer: { marginTop: Spacing.sm },
  ctaBtn: {},
  ctaHint: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textTertiary, marginTop: Spacing.sm },
  employerNotice: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  employerNoticeText: { color: Colors.warning, fontSize: Typography.sm, textAlign: 'center' },
  appliedBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
  },
  appliedText: { color: Colors.success, fontSize: Typography.base, fontWeight: Typography.semiBold },
});
