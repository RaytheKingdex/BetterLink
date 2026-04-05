// src/screens/shared/ProfileScreen.js
// BetterLink — My Profile (GET + PUT /api/users/me)

import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { updateMe, deleteMe } from '../../api/users';
import { Button, InputField, Card, Badge, LoadingSpinner } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ firstName, lastName, role }) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || '?';

  const isStudent = role === 'Student';

  return (
    <View style={styles.avatarContainer}>
      <View style={[styles.avatar, isStudent ? styles.avatarStudent : styles.avatarEmployer]}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
      <Badge
        label={role || 'Member'}
        color={isStudent ? Colors.primary : Colors.accent}
        bgColor={isStudent ? Colors.primaryLight : Colors.accentLight}
      />
    </View>
  );
}

UserAvatar.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  role: PropTypes.string,
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, role, signOut, refreshUser, isLoading: authLoading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }

  function startEditing() {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setBio(user?.bio || '');
    setErrors({});
    setApiError('');
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setErrors({});
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError('');
    try {
      await updateMe({ firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() });
      await refreshUser();
      setEditing(false);
      Alert.alert('Profile Updated', 'Your name has been saved successfully.');
    } catch (err) {
      setApiError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteAccount() {
    const doDelete = async () => {
      try {
        await deleteMe();
        await signOut();
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to delete account.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Permanently delete your account? This cannot be undone.')) doDelete();
      return;
    }
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: doDelete },
      ]
    );
  }

  function confirmSignOut() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out of BetterLink?')) signOut();
      return;
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of BetterLink?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  }

  if (authLoading || !user) {
    return (
      <View style={styles.flex}>
        <LoadingSpinner style={styles.loader} />
      </View>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'BetterLink User';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Avatar + name */}
        <UserAvatar firstName={user.firstName} lastName={user.lastName} role={role} />

        <Text style={styles.displayName}>{fullName}</Text>
        <Text style={styles.displayEmail}>{user.email}</Text>

        {/* Account Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="First Name" value={user.firstName} />
          <InfoItem label="Last Name" value={user.lastName} />
          <InfoItem label="Bio" value={user.bio} />
          <InfoItem label="Role" value={role} />
          <InfoItem label="User ID" value={String(user.userId)} />
        </Card>

        {/* Edit Form */}
        {editing ? (
          <Card style={styles.editCard}>
            <Text style={styles.cardTitle}>Edit Profile</Text>

            {apiError ? (
              <View style={styles.apiBanner}>
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            ) : null}

            <InputField
              label="First Name *"
              value={firstName}
              onChangeText={(v) => { setFirstName(v); if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' })); }}
              placeholder="First name"
              autoCapitalize="words"
              error={errors.firstName}
            />
            <InputField
              label="Last Name *"
              value={lastName}
              onChangeText={(v) => { setLastName(v); if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' })); }}
              placeholder="Last name"
              autoCapitalize="words"
              error={errors.lastName}
            />
            <InputField
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others a bit about yourself..."
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            <View style={styles.editActions}>
              <Button label="Cancel" onPress={cancelEditing} variant="outline" style={styles.editActionBtn} />
              <Button label="Save Changes" onPress={handleSave} loading={saving} style={styles.editActionBtn} />
            </View>
          </Card>
        ) : (
          <Button label="Edit Profile" onPress={startEditing} variant="outline" style={styles.editBtn} />
        )}

        {/* Role Info Banner */}
        <Card style={[styles.roleCard, role === 'Student' ? styles.roleCardStudent : styles.roleCardEmployer]}>
          <Text style={styles.roleCardEmoji}>{role === 'Student' ? '🎓' : '🏢'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleCardTitle}>
              {role === 'Student' ? 'Student Account' : 'Employer Account'}
            </Text>
            <Text style={styles.roleCardDesc}>
              {role === 'Student'
                ? 'You can browse jobs, apply to positions, and join communities.'
                : 'You can post job listings and connect with student talent.'}
            </Text>
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          label="Sign Out"
          onPress={confirmSignOut}
          variant="danger"
          style={styles.signOutBtn}
        />

        {/* Delete Account */}
        <Button
          label="Delete Account"
          onPress={confirmDeleteAccount}
          variant="danger"
          style={styles.deleteAccountBtn}
        />

        <Text style={styles.versionText}>BetterLink Mobile v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

ProfileScreen.propTypes = {};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: Spacing['4xl'] },
  container: { paddingHorizontal: Spacing.base, paddingTop: Spacing['2xl'], paddingBottom: Spacing['4xl'] },

  avatarContainer: { alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStudent: { backgroundColor: Colors.primary },
  avatarEmployer: { backgroundColor: Colors.accent },
  avatarInitials: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: '#fff' },

  displayName: { textAlign: 'center', fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  displayEmail: { textAlign: 'center', fontSize: Typography.base, color: Colors.textSecondary, marginBottom: Spacing.xl },

  infoCard: { marginBottom: Spacing.base },
  cardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoLabel: { fontSize: Typography.sm, color: Colors.textTertiary, fontWeight: Typography.medium },
  infoValue: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium, maxWidth: '60%', textAlign: 'right' },

  editCard: { marginBottom: Spacing.base, backgroundColor: Colors.primaryLight, borderColor: Colors.primary + '30' },
  apiBanner: { backgroundColor: Colors.errorLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  apiErrorText: { color: Colors.error, fontSize: Typography.sm },
  editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  editActionBtn: { flex: 1 },

  editBtn: { marginBottom: Spacing.base },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  roleCardStudent: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary + '30' },
  roleCardEmployer: { backgroundColor: Colors.accentLight, borderColor: Colors.accent + '30' },
  roleCardEmoji: { fontSize: 28 },
  roleCardTitle: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  roleCardDesc: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },

  signOutBtn: { marginBottom: Spacing.sm },
  deleteAccountBtn: { marginBottom: Spacing.lg, opacity: 0.75 },
  versionText: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textTertiary },
});
