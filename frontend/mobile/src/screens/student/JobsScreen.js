// src/screens/student/JobsScreen.js
// BetterLink — Browse Jobs

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getJobs } from '../../api/jobs';
import { LoadingSpinner, EmptyState, ErrorBanner, Badge } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPLOYMENT_TAG_COLORS = {
  'full-time': { color: Colors.fullTime, bg: Colors.fullTimeLight },
  'part-time': { color: Colors.partTime, bg: Colors.partTimeLight },
  internship: { color: Colors.internship, bg: Colors.internshipLight },
  contract: { color: Colors.contract, bg: Colors.contractLight },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-JM', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTagColors(type) {
  const key = (type || '').toLowerCase();
  return EMPLOYMENT_TAG_COLORS[key] || { color: Colors.textSecondary, bg: Colors.borderLight };
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onPress }) {
  const tag = getTagColors(job.employmentType);
  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress} activeOpacity={0.85}>
      {/* Employer row */}
      <View style={styles.employerRow}>
        <View style={styles.employerAvatar}>
          <Text style={styles.employerAvatarText}>
            {(job.employerName || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.employerInfo}>
          <Text style={styles.employerName} numberOfLines={1}>{job.employerName}</Text>
          <Text style={styles.jobLocation} numberOfLines={1}>{job.location || 'Remote / TBD'}</Text>
        </View>
        <Badge
          label={job.employmentType || 'Open'}
          color={tag.color}
          bgColor={tag.bg}
        />
      </View>

      <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
      <Text style={styles.jobDesc} numberOfLines={3}>{job.description}</Text>

      <View style={styles.jobFooter}>
        <Text style={styles.postedDate}>Posted {formatDate(job.postedDate)}</Text>
        <View style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>View →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    employerName: PropTypes.string,
    location: PropTypes.string,
    employmentType: PropTypes.string,
    postedDate: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchTimeout = useRef(null);
  const PAGE_SIZE = 20;

  const fetchJobs = useCallback(async (q, p, append = false) => {
    try {
      const data = await getJobs({ title: q, page: p, pageSize: PAGE_SIZE });
      if (append) {
        setJobs((prev) => [...prev, ...data]);
      } else {
        setJobs(data);
      }
      setHasMore(data.length === PAGE_SIZE);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load jobs.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchJobs(search, 1, false).finally(() => setLoading(false));
  }, []);

  // Debounced search
  function handleSearch(text) {
    setSearch(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setLoading(true);
      fetchJobs(text, 1, false).finally(() => setLoading(false));
    }, 450);
  }

  async function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    await fetchJobs(search, 1, false);
    setRefreshing(false);
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchJobs(search, nextPage, true);
    setLoadingMore(false);
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
            placeholder="Search jobs by title..."
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error ? (
        <ErrorBanner message={error} onRetry={() => { setLoading(true); fetchJobs(search, 1, false).finally(() => setLoading(false)); }} />
      ) : null}

      {loading ? (
        <LoadingSpinner style={styles.loader} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              emoji="💼"
              title="No jobs found"
              subtitle={search ? `No results for "${search}". Try a different title.` : 'No open jobs at the moment. Check back soon!'}
            />
          }
          ListFooterComponent={
            loadingMore ? <LoadingSpinner size="small" style={styles.footerLoader} /> : null
          }
        />
      )}
    </View>
  );
}

JobsScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  clearIcon: { fontSize: 14, color: Colors.textTertiary, padding: 4 },
  loader: { marginTop: Spacing['3xl'] },
  listContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing['3xl'] },
  footerLoader: { paddingVertical: Spacing.lg },

  // Job Card
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  employerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  employerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  employerAvatarText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.primary },
  employerInfo: { flex: 1, marginRight: Spacing.sm },
  employerName: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  jobLocation: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  jobTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  jobDesc: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  jobFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postedDate: { fontSize: Typography.xs, color: Colors.textTertiary },
  applyBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  applyBtnText: { color: Colors.primary, fontSize: Typography.xs, fontWeight: Typography.semiBold },
});
