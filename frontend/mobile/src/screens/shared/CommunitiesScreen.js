// src/screens/shared/CommunitiesScreen.js
// BetterLink — Communities Hub

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { createCommunity, getCommunityById, joinCommunity, searchCommunities } from '../../api/communities';
import { Button, InputField, Card } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// ─── Search by Name Panel ─────────────────────────────────────────────────────
function SearchPanel({ onFound }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(null);
  const timeout = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchCommunities(query);
        setResults(data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(timeout.current);
  }, [query]);

  async function handleJoin(community) {
    setJoining(community.id);
    try {
      await joinCommunity(community.id);
      Alert.alert('Joined! 🎉', `You joined ${community.name}.`, [
        { text: 'Open', onPress: () => onFound(community.id, community.name) },
        { text: 'OK' },
      ]);
    } catch (err) {
      if (err.status === 409) {
        onFound(community.id, community.name);
      } else {
        Alert.alert('Error', err.message || 'Failed to join.');
      }
    } finally { setJoining(null); }
  }

  return (
    <View style={styles.searchPanel}>
      <Text style={styles.panelHeading}>Search Communities</Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name..."
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {searching && <Text style={styles.searchStatus}>Searching...</Text>}

      {!searching && query.length >= 2 && results.length === 0 && (
        <Text style={styles.searchStatus}>No communities found.</Text>
      )}

      {results.map((c) => (
        <View key={c.id} style={styles.searchResult}>
          <View style={styles.communityIcon}>
            <Text style={styles.communityIconText}>{(c.name || '#')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.searchResultInfo}>
            <Text style={styles.communityName}>{c.name}</Text>
            <Text style={styles.memberCount}>{c.memberCount} member{c.memberCount !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            style={[styles.joinBtn, joining === c.id && styles.joinBtnDisabled]}
            onPress={() => handleJoin(c)}
            disabled={joining === c.id}
          >
            <Text style={styles.joinBtnText}>{joining === c.id ? '...' : 'Join'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

SearchPanel.propTypes = { onFound: PropTypes.func.isRequired };

// ─── Quick Lookup Panel ───────────────────────────────────────────────────────
function LookupPanel({ onFound }) {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  async function handleLookup() {
    if (!id.trim() || isNaN(id)) {
      setError('Enter a valid numeric community ID.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getCommunityById(Number(id));
      setResult(data);
    } catch (err) {
      setError(err.status === 404 ? 'Community not found.' : (err.message || 'Lookup failed.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(communityId) {
    setJoining(true);
    try {
      await joinCommunity(communityId);
      Alert.alert('Joined! 🎉', 'You are now a member of this community.', [
        { text: 'Go to Community', onPress: () => onFound(result.id, result.name) },
        { text: 'Stay Here' },
      ]);
    } catch (err) {
      if (err.status === 409) {
        Alert.alert('Already a Member', 'You are already in this community.', [
          { text: 'Go to Community', onPress: () => onFound(result.id, result.name) },
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Error', err.message || 'Failed to join community.');
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <View style={styles.lookupPanel}>
      <Text style={styles.panelHeading}>Find a Community</Text>
      <Text style={styles.panelSub}>Enter a community ID shared with you to look it up and join.</Text>

      <View style={styles.lookupRow}>
        <View style={{ flex: 1 }}>
          <InputField
            value={id}
            onChangeText={(v) => { setId(v); setError(''); setResult(null); }}
            placeholder="Community ID (e.g. 42)"
            keyboardType="number-pad"
            error={error}
          />
        </View>
        <Button
          label="Find"
          onPress={handleLookup}
          loading={loading}
          style={styles.lookupBtn}
        />
      </View>

      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.communityIcon}>
              <Text style={styles.communityIconText}>
                {(result.name || '#')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.communityName}>{result.name}</Text>
              <Text style={styles.memberCount}>{result.memberCount} member{result.memberCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          {result.description ? (
            <Text style={styles.communityDesc} numberOfLines={3}>{result.description}</Text>
          ) : null}
          <View style={styles.resultActions}>
            <Button
              label="Join Community"
              onPress={() => handleJoin(result.id)}
              loading={joining}
              style={{ flex: 1 }}
            />
            <Button
              label="Open"
              onPress={() => onFound(result.id, result.name)}
              variant="outline"
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      )}
    </View>
  );
}

LookupPanel.propTypes = {
  onFound: PropTypes.func.isRequired,
};

// ─── Create Community Modal ───────────────────────────────────────────────────
function CreateCommunityModal({ visible, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Community name is required.';
    else if (name.trim().length < 3) errs.name = 'Name must be at least 3 characters.';
    return errs;
  }

  async function handleCreate() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await createCommunity({ name: name.trim(), description: description.trim() });
      onCreate(res.id || res?.id, name.trim());
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to create community.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setName('');
    setDescription('');
    setErrors({});
    setApiError('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Community</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSub}>
            Start a new space for students with shared academic or professional interests.
          </Text>

          {apiError ? (
            <View style={styles.apiBanner}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <InputField
            label="Community Name *"
            value={name}
            onChangeText={(v) => { setName(v); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
            placeholder="e.g. NCU Computer Science Students"
            autoCapitalize="words"
            error={errors.name}
          />

          <InputField
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="What is this community about?"
            multiline
            numberOfLines={4}
          />

          <Button
            label="Create Community"
            onPress={handleCreate}
            loading={loading}
            style={styles.modalSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

CreateCommunityModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunitiesScreen({ navigation }) {
  const [showCreate, setShowCreate] = useState(false);
  const [recentCommunities, setRecentCommunities] = useState([]);

  function handleFound(id, name) {
    navigation.navigate('CommunityDetail', { communityId: id });
    if (id) {
      setRecentCommunities((prev) => [
        { id, name: name || `Community #${id}` },
        ...prev.filter((x) => x.id !== id),
      ]);
    }
  }

  function handleCreated(id, name) {
    if (id) {
      setRecentCommunities((prev) => [
        { id, name: name || `Community #${id}` },
        ...prev.filter((x) => x.id !== id),
      ]);
      Alert.alert(
        'Community Created!',
        `Your community is live. Share its ID (${id}) so others can join.`,
        [
          { text: 'Open Community', onPress: () => handleFound(id, name) },
          { text: 'OK' },
        ]
      );
    }
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>Communities</Text>
          <Text style={styles.heroSub}>
            Connect with students across Jamaican universities.
            Join field-specific groups and collaborate.
          </Text>
        </View>

        {/* Create CTA */}
        <Card style={styles.createCard}>
          <Text style={styles.createHeading}>Start Something New</Text>
          <Text style={styles.createDesc}>
            Create a community for your program, faculty, or shared interest.
          </Text>
          <Button
            label="+ Create Community"
            onPress={() => setShowCreate(true)}
            style={styles.createBtn}
          />
        </Card>

        {/* Search by name */}
        <SearchPanel onFound={handleFound} />

        {/* Lookup by ID */}
        <LookupPanel onFound={handleFound} />

        {/* Recent communities */}
        {recentCommunities.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentHeading}>Recently Visited</Text>
            {recentCommunities.map((community) => (
              <TouchableOpacity
                key={community.id}
                style={styles.recentItem}
                onPress={() => handleFound(community.id, community.name)}
              >
                <View style={styles.recentIcon}>
                  <Text style={styles.recentIconText}>
                    {(community.name || '#')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.recentText}>{community.name}</Text>
                <Text style={styles.recentArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tip banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipTitle}>📢 How it works</Text>
          <Text style={styles.tipText}>
            Create or join communities, then post messages to collaborate with members.
            Share a community's ID with your classmates so they can find and join it.
          </Text>
        </View>
      </ScrollView>

      <CreateCommunityModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreated}
      />
    </View>
  );
}

CommunitiesScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing['4xl'] },

  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  heroEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  heroTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  heroSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  createCard: { marginBottom: Spacing.base },
  createHeading: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  createDesc: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  createBtn: {},

  // Search Panel
  searchPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary, paddingVertical: 0 },
  searchClear: { fontSize: 13, color: Colors.textTertiary, paddingHorizontal: 4 },
  searchStatus: { fontSize: Typography.sm, color: Colors.textTertiary, fontStyle: 'italic', paddingVertical: Spacing.sm },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  searchResultInfo: { flex: 1, minWidth: 0 },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  joinBtnDisabled: { opacity: 0.5 },
  joinBtnText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.semiBold },

  // Lookup Panel
  lookupPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  panelHeading: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  panelSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  lookupRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  lookupBtn: { paddingHorizontal: Spacing.base, marginTop: 24, minWidth: 80 },
  resultCard: { marginTop: Spacing.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  communityIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  communityIconText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  resultInfo: { flex: 1 },
  communityName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  memberCount: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  communityDesc: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  resultActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },

  // Recent
  recentSection: { marginBottom: Spacing.base },
  recentHeading: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recentIconText: { fontWeight: Typography.bold, color: Colors.primary },
  recentText: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  recentArrow: { color: Colors.primary, fontWeight: Typography.bold },

  // Tip
  tipBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  tipTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.warning, marginBottom: Spacing.sm },
  tipText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Modal
  modalFlex: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  modalClose: { padding: Spacing.sm },
  modalCloseText: { color: Colors.primary, fontSize: Typography.base, fontWeight: Typography.medium },
  modalBody: { padding: Spacing.base },
  modalSub: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  apiBanner: { backgroundColor: Colors.errorLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  apiErrorText: { color: Colors.error, fontSize: Typography.sm },
  modalSubmit: { marginTop: Spacing.sm },
});
