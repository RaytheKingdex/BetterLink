// src/screens/shared/SearchScreen.js
// BetterLink — People & Jobs Search

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { searchStudents, searchEmployers } from '../../api/search';
import { getJobs } from '../../api/jobs';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ first, last, color = Colors.primary }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
      <Text style={[styles.avatarText, { color }]}>{initials(first, last)}</Text>
    </View>
  );
}

Avatar.propTypes = { first: PropTypes.string, last: PropTypes.string, color: PropTypes.string };

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({ item }) {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Student';
  return (
    <View style={styles.card}>
      <Avatar first={item.firstName} last={item.lastName} color={Colors.primary} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{fullName}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{item.programName} · {item.university}</Text>
        {item.skills ? (
          <Text style={styles.cardMeta} numberOfLines={1}>🛠 {item.skills}</Text>
        ) : null}
      </View>
      {item.graduationYear ? (
        <View style={styles.yearBadge}>
          <Text style={styles.yearBadgeText}>{item.graduationYear}</Text>
        </View>
      ) : null}
    </View>
  );
}

StudentCard.propTypes = { item: PropTypes.object.isRequired };

// ─── Employer Card ────────────────────────────────────────────────────────────
function EmployerCard({ item }) {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Employer';
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: Colors.accent + '22' }]}>
        <Text style={[styles.avatarText, { color: Colors.accent }]}>
          {(item.organizationName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.organizationName}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{fullName}</Text>
        {item.industry ? (
          <Text style={styles.cardMeta} numberOfLines={1}>🏭 {item.industry}{item.location ? ` · ${item.location}` : ''}</Text>
        ) : null}
      </View>
      {item.activeJobCount > 0 ? (
        <View style={styles.jobsBadge}>
          <Text style={styles.jobsBadgeText}>{item.activeJobCount} job{item.activeJobCount !== 1 ? 's' : ''}</Text>
        </View>
      ) : null}
    </View>
  );
}

EmployerCard.propTypes = { item: PropTypes.object.isRequired };

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: Colors.primary + '22' }]}>
        <Text style={[styles.avatarText, { color: Colors.primary }]}>💼</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{item.employerName}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>📍 {item.location || 'Jamaica'}</Text>
      </View>
      <View style={[styles.yearBadge, { backgroundColor: Colors.primaryLight }]}>
        <Text style={[styles.yearBadgeText, { color: Colors.primary }]}>
          {item.employmentType}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

JobCard.propTypes = {
  item: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyResult({ query, loading }) {
  if (loading) return null;
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{query.length >= 2 ? '🔍' : '👋'}</Text>
      <Text style={styles.emptyTitle}>
        {query.length >= 2 ? 'No results found' : 'Start searching'}
      </Text>
      <Text style={styles.emptySub}>
        {query.length >= 2
          ? `No matches for "${query}"`
          : 'Type at least 2 characters to search'}
      </Text>
    </View>
  );
}

EmptyResult.propTypes = { query: PropTypes.string.isRequired, loading: PropTypes.bool.isRequired };

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen({ navigation }) {
  const { isStudent, isEmployer } = useAuth();

  // For students: 'employers' | 'jobs'. For employers: always 'students'
  const [tab, setTab] = useState(isStudent ? 'employers' : 'students');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const doSearch = useCallback(async (q, currentTab) => {
    setLoading(true);
    try {
      let data = [];
      if (currentTab === 'students') data = await searchStudents(q);
      else if (currentTab === 'employers') data = await searchEmployers(q);
      else if (currentTab === 'jobs') data = await getJobs({ title: q, pageSize: 30 });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(query, tab), 400);
    return () => clearTimeout(debounce.current);
  }, [query, tab, doSearch]);

  function handleTabChange(newTab) {
    setTab(newTab);
    setResults([]);
    if (query.length >= 2) doSearch(query, newTab);
  }

  function renderItem({ item }) {
    if (tab === 'students') return <StudentCard item={item} />;
    if (tab === 'employers') return <EmployerCard item={item} />;
    return (
      <JobCard
        item={item}
        onPress={() => navigation.navigate('Jobs', { screen: 'JobDetail', params: { jobId: item.id } })}
      />
    );
  }

  return (
    <View style={styles.flex}>
      {/* Search Bar */}
      <View style={styles.searchBarWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={
            tab === 'students' ? 'Search students by name, university, skills…'
            : tab === 'employers' ? 'Search employers by company, industry…'
            : 'Search jobs by title…'
          }
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {loading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />}
      </View>

      {/* Tab Toggle (students only) */}
      {isStudent ? (
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'employers' && styles.tabBtnActive]}
            onPress={() => handleTabChange('employers')}
          >
            <Text style={[styles.tabBtnText, tab === 'employers' && styles.tabBtnTextActive]}>🏢 Employers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'jobs' && styles.tabBtnActive]}
            onPress={() => handleTabChange('jobs')}
          >
            <Text style={[styles.tabBtnText, tab === 'jobs' && styles.tabBtnTextActive]}>💼 Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item, i) => String(item.userId ?? item.id ?? i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyResult query={query} loading={loading} />}
      />
    </View>
  );
}

SearchScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'web' ? Spacing.sm : Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  tabBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tabBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },

  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  yearBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginLeft: Spacing.sm,
  },
  yearBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.accent,
  },
  jobsBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginLeft: Spacing.sm,
  },
  jobsBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
