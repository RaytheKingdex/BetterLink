// src/screens/employer/EmployerJobApplicantsScreen.js
// BetterLink — Employer: applicants list with sorting

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getJobApplicants, updateApplicationStatus } from '../../api/jobs';
import { useSidebar } from '../../context/SidebarContext';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';

const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest' },
  { key: 'date_asc',  label: 'Oldest' },
  { key: 'gpa_desc',  label: 'GPA ↑' },
  { key: 'gpa_asc',   label: 'GPA ↓' },
  { key: 'grad_asc',  label: 'Grad ↑' },
  { key: 'grad_desc', label: 'Grad ↓' },
];

function initials(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusStyle(status) {
  if (status === 'accepted') return { chip: styles.chipAccepted, text: styles.chipAcceptedText };
  if (status === 'rejected') return { chip: styles.chipRejected, text: styles.chipRejectedText };
  if (status === 'submitted') return { chip: styles.chipSubmitted, text: styles.chipSubmittedText };
  return { chip: styles.chipReviewed, text: styles.chipReviewedText };
}

function ApplicantCard({ item, onMessage, onHire, onReject }) {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Student';
  const ss = statusStyle(item.status);
  const isDecided = item.status === 'accepted' || item.status === 'rejected';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.firstName, item.lastName)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{fullName}</Text>
          {item.displayId ? <Text style={styles.cardId}>ID {item.displayId.slice(0, 4)}****</Text> : null}
          <Text style={styles.cardSub} numberOfLines={1}>{item.programName} · {item.university}</Text>
        </View>
        <TouchableOpacity style={styles.msgBtn} onPress={() => onMessage(item)} activeOpacity={0.8}>
          <Text style={styles.msgBtnText}>💬</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipsRow}>
        {item.gpa != null ? (
          <View style={[styles.chip, styles.chipGpa]}>
            <Text style={[styles.chipText, styles.chipGpaText]}>GPA {Number(item.gpa).toFixed(2)}</Text>
          </View>
        ) : null}
        {item.graduationYear ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>Class of {item.graduationYear}</Text>
          </View>
        ) : null}
        <View style={[styles.chip, ss.chip]}>
          <Text style={[styles.chipText, ss.text]}>{item.status}</Text>
        </View>
      </View>

      {item.skills ? <Text style={styles.skills} numberOfLines={1}>🛠 {item.skills}</Text> : null}
      {item.coverLetter ? <Text style={styles.coverLetter} numberOfLines={2}>"{item.coverLetter}"</Text> : null}
      <Text style={styles.appliedAt}>Applied {formatDate(item.appliedAt)}</Text>

      {!isDecided && (
        <View style={styles.decisionRow}>
          <TouchableOpacity style={styles.hireBtn} onPress={() => onHire(item)} activeOpacity={0.8}>
            <Text style={styles.hireBtnText}>✓ Hire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item)} activeOpacity={0.8}>
            <Text style={styles.rejectBtnText}>✕ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

ApplicantCard.propTypes = {
  item: PropTypes.object.isRequired,
  onMessage: PropTypes.func.isRequired,
  onHire: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default function EmployerJobApplicantsScreen({ route }) {
  const { job } = route.params;
  const { openWithContact } = useSidebar();
  const [sortBy, setSortBy] = useState('date_desc');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplicants = useCallback(async (sort) => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobApplicants(job.id, sort);
      setApplicants(data);
    } catch (err) {
      setError(err.message || 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => { fetchApplicants(sortBy); }, [sortBy, fetchApplicants]);

  function confirmAction(applicant, status) {
    const isHire = status === 'accepted';
    const label = isHire ? 'Hire' : 'Reject';
    const fullName = [applicant.firstName, applicant.lastName].filter(Boolean).join(' ') || 'this applicant';
    const msg = isHire
      ? `Hire ${fullName}? They will receive an automated message congratulating them.`
      : `Reject ${fullName}? This will update their application status.`;

    const doUpdate = async () => {
      try {
        await updateApplicationStatus(job.id, applicant.applicationId, status);
        setApplicants((prev) =>
          prev.map((a) => a.applicationId === applicant.applicationId ? { ...a, status } : a)
        );
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to update status.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doUpdate();
      return;
    }
    Alert.alert(label, msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, style: isHire ? 'default' : 'destructive', onPress: doUpdate },
    ]);
  }

  return (
    <View style={styles.flex}>
      {/* Job summary */}
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
        <View style={styles.jobMeta}>
          {job.location ? <Text style={styles.jobMetaText}>📍 {job.location}</Text> : null}
          <Text style={styles.jobMetaText}>🗓 Posted {formatDate(job.postedDate)}</Text>
        </View>
        <Text style={styles.applicantSummary}>
          {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Sort bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortRow}
      >
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={applicants}
          keyExtractor={(item) => String(item.applicationId)}
          renderItem={({ item }) => (
            <ApplicantCard
              item={item}
              onMessage={(applicant) => openWithContact({
                userId: applicant.studentUserId,
                firstName: applicant.firstName,
                lastName: applicant.lastName,
              })}
              onHire={(applicant) => confirmAction(applicant, 'accepted')}
              onReject={(applicant) => confirmAction(applicant, 'rejected')}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No applicants yet</Text>
              <Text style={styles.emptyText}>Applications will appear here once students apply.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

EmployerJobApplicantsScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({ job: PropTypes.object.isRequired }).isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  jobCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  jobTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  jobMeta: { gap: 3, marginBottom: Spacing.xs },
  jobMetaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  applicantSummary: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.primary, marginTop: Spacing.xs },

  sortScroll: { maxHeight: 48, backgroundColor: Colors.surface },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  sortLabel: { fontSize: Typography.sm, color: Colors.textTertiary, fontWeight: Typography.medium },
  sortChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  sortChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  sortChipText: { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.textSecondary },
  sortChipTextActive: { color: Colors.primary, fontWeight: Typography.semiBold },

  list: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  loader: { marginTop: Spacing['3xl'] },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  avatarText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  msgBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  msgBtnText: { fontSize: 16 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  cardId: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 1 },
  cardSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.border },
  chipText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipGpa: { backgroundColor: Colors.primaryLight },
  chipGpaText: { color: Colors.primary, fontWeight: Typography.bold },
  chipSubmitted: { backgroundColor: Colors.infoLight },
  chipSubmittedText: { color: Colors.info },
  chipReviewed: { backgroundColor: Colors.successLight },
  chipReviewedText: { color: Colors.success },
  chipAccepted: { backgroundColor: Colors.successLight },
  chipAcceptedText: { color: Colors.success, fontWeight: Typography.bold },
  chipRejected: { backgroundColor: Colors.errorLight },
  chipRejectedText: { color: Colors.error, fontWeight: Typography.bold },

  decisionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  hireBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radius.md, backgroundColor: Colors.success,
  },
  hireBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },
  rejectBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error,
  },
  rejectBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.error },

  skills: { fontSize: Typography.xs, color: Colors.textTertiary, marginBottom: 4 },
  coverLetter: { fontSize: Typography.xs, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: 4, lineHeight: 18 },
  appliedAt: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
