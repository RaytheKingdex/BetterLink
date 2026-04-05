// src/screens/employer/EmployerMyJobsScreen.js
// BetterLink — Employer: view, edit, delete own job listings

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getMyJobs, deleteJob } from '../../api/jobs';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function JobCard({ job, onViewApplicants, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      {/* Title + status */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>{job.title}</Text>
        <View style={[styles.statusPill, job.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
          <Text style={[styles.statusText, job.status === 'open' ? styles.statusOpenText : styles.statusClosedText]}>
            {job.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        {job.location ? <Text style={styles.metaText}>📍 {job.location}</Text> : null}
        <Text style={styles.metaText}>💼 {job.employmentType}</Text>
        <Text style={styles.metaText}>🗓 {formatDate(job.postedDate)}</Text>
        {job.applicationDeadline ? (
          <Text style={styles.metaText}>⏰ Deadline {formatDate(job.applicationDeadline)}</Text>
        ) : null}
      </View>

      {/* Applicant count */}
      <TouchableOpacity style={styles.applicantRow} onPress={onViewApplicants} activeOpacity={0.8}>
        <Text style={styles.applicantCount}>{job.applicantCount}</Text>
        <Text style={styles.applicantLabel}>
          applicant{job.applicantCount !== 1 ? 's' : ''} — tap to view
        </Text>
        <Text style={styles.applicantArrow}>›</Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  onViewApplicants: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function EmployerMyJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setError('');
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function handleRefresh() {
    setRefreshing(true);
    fetchJobs();
  }

  function confirmDelete(job) {
    const doDelete = async () => {
      try {
        await deleteJob(job.id);
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to delete job.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${job.title}"? This cannot be undone.`)) doDelete();
      return;
    }
    Alert.alert(
      'Delete Job',
      `Delete "${job.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <JobCard
          job={item}
          onViewApplicants={() => navigation.navigate('JobApplicants', { job: item })}
          onEdit={() => navigation.navigate('EditJob', { job: item })}
          onDelete={() => confirmDelete(item)}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      ListEmptyComponent={
        error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>Post a job to start receiving applications.</Text>
          </View>
        )
      }
    />
  );
}

EmployerMyJobsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  list: { padding: Spacing.base, paddingBottom: Spacing['3xl'], backgroundColor: Colors.background },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm, gap: Spacing.sm },
  cardTitle: { flex: 1, fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },

  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  statusOpen: { backgroundColor: Colors.successLight },
  statusClosed: { backgroundColor: Colors.errorLight },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  statusOpenText: { color: Colors.success },
  statusClosedText: { color: Colors.error },

  metaRow: { gap: 3, marginBottom: Spacing.sm },
  metaText: { fontSize: Typography.xs, color: Colors.textSecondary },

  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  applicantCount: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  applicantLabel: { flex: 1, fontSize: Typography.sm, color: Colors.primary },
  applicantArrow: { fontSize: Typography.lg, color: Colors.primary },

  actions: { flexDirection: 'row', gap: Spacing.sm },
  editBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.primary },
  deleteBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  deleteBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.error },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 44, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
