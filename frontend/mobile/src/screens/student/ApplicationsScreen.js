// src/screens/student/ApplicationsScreen.js
// BetterLink — My Applications (Student only)

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getMyApplications } from '../../api/applications';
import { Card, Badge, EmptyState, ErrorBanner, LoadingSpinner } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  submitted: { color: Colors.info, bg: Colors.infoLight, label: 'Submitted' },
  reviewing: { color: Colors.warning, bg: Colors.warningLight, label: 'Under Review' },
  shortlisted: { color: Colors.primary, bg: Colors.primaryLight, label: 'Shortlisted' },
  accepted: { color: Colors.success, bg: Colors.successLight, label: 'Accepted 🎉' },
  rejected: { color: Colors.error, bg: Colors.errorLight, label: 'Not Selected' },
};

function getStatus(status) {
  const key = (status || '').toLowerCase();
  return STATUS_STYLES[key] || { color: Colors.textSecondary, bg: Colors.borderLight, label: status };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-JM', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Application Card ─────────────────────────────────────────────────────────
function ApplicationCard({ item }) {
  const status = getStatus(item.status);
  return (
    <Card style={styles.appCard}>
      <View style={styles.cardHeader}>
        <View style={styles.employerAvatar}>
          <Text style={styles.employerAvatarText}>
            {(item.employerName || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
          <Text style={styles.employerName} numberOfLines={1}>{item.employerName}</Text>
        </View>
        <Badge label={status.label} color={status.color} bgColor={status.bg} />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Applied</Text>
          <Text style={styles.metaValue}>{formatDate(item.appliedAt)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Application ID</Text>
          <Text style={styles.metaValue}>#{item.applicationId}</Text>
        </View>
      </View>
    </Card>
  );
}

ApplicationCard.propTypes = {
  item: PropTypes.shape({
    applicationId: PropTypes.number,
    jobId: PropTypes.number,
    jobTitle: PropTypes.string,
    employerName: PropTypes.string,
    status: PropTypes.string,
    appliedAt: PropTypes.string,
  }).isRequired,
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ applications }) {
  const total = applications.length;
  const accepted = applications.filter((a) => a.status?.toLowerCase() === 'accepted').length;
  const pending = applications.filter((a) =>
    ['submitted', 'reviewing', 'shortlisted'].includes(a.status?.toLowerCase())
  ).length;

  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: Colors.warning }]}>{pending}</Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: Colors.success }]}>{accepted}</Text>
        <Text style={styles.statLabel}>Accepted</Text>
      </View>
    </View>
  );
}

StatsBar.propTypes = {
  applications: PropTypes.array.isRequired,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ApplicationsScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async () => {
    setError('');
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchApplications().finally(() => setLoading(false));
  }, [fetchApplications]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.flex}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <LoadingSpinner style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {error ? (
        <ErrorBanner message={error} onRetry={() => { setLoading(true); fetchApplications().finally(() => setLoading(false)); }} />
      ) : null}

      <FlatList
        data={applications}
        keyExtractor={(item) => String(item.applicationId)}
        renderItem={({ item }) => <ApplicationCard item={item} />}
        ListHeaderComponent={
          applications.length > 0 ? (
            <StatsBar applications={applications} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            emoji="📋"
            title="No applications yet"
            subtitle="Browse jobs and apply to internships and full-time positions."
            action="Browse Jobs"
            onAction={() => navigation.navigate('Jobs')}
          />
        }
      />
    </View>
  );
}

ApplicationsScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: Spacing['3xl'] },
  listContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },

  appCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  employerAvatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  employerAvatarText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.primary },
  cardHeaderInfo: { flex: 1, marginRight: Spacing.sm },
  jobTitle: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  employerName: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },

  cardMeta: { flexDirection: 'row', gap: Spacing.xl },
  metaItem: {},
  metaLabel: { fontSize: Typography.xs, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary, marginTop: 2 },
});
