// src/screens/auth/RegisterEmployerScreen.js
// BetterLink — Employer Registration

import React, { useState } from 'react';
import {
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
import { useAuth } from '../../context/AuthContext';
import { registerEmployer } from '../../api/auth';
import { Button, InputField } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export default function RegisterEmployerScreen({ navigation }) {
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    industry: '',
    website: '',
    location: '',
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
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    if (!form.organizationName.trim()) errs.organizationName = 'Organization name is required.';
    return errs;
  }

  async function handleRegister() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        organizationName: form.organizationName.trim(),
        ...(form.industry ? { industry: form.industry.trim() } : {}),
        ...(form.website ? { website: form.website.trim() } : {}),
        ...(form.location ? { location: form.location.trim() } : {}),
      };
      const res = await registerEmployer(payload);
      await signIn(res);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
        <View style={styles.header}>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>🏢  Employer</Text>
          </View>
          <Text style={styles.heading}>Create employer account</Text>
          <Text style={styles.subHeading}>
            Post jobs and internships for Jamaican university students.
          </Text>
        </View>

        {apiError ? (
          <View style={styles.apiBanner}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Details</Text>
          <InputField label="Your Full Name *" value={form.fullName} onChangeText={(v) => setField('fullName', v)} placeholder="e.g. Marcus Williams" autoCapitalize="words" error={errors.fullName} />
          <InputField label="Email Address *" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <InputField label="Password *" value={form.password} onChangeText={(v) => setField('password', v)} placeholder="Min 8 characters" secureTextEntry autoCapitalize="none" error={errors.password} />
          <InputField label="Confirm Password *" value={form.confirmPassword} onChangeText={(v) => setField('confirmPassword', v)} placeholder="Repeat password" secureTextEntry autoCapitalize="none" error={errors.confirmPassword} />
        </View>

        {/* Organization */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Organization</Text>
          <InputField label="Organization Name *" value={form.organizationName} onChangeText={(v) => setField('organizationName', v)} placeholder="e.g. DigiServe Jamaica Ltd." autoCapitalize="words" error={errors.organizationName} />
          <InputField label="Industry" value={form.industry} onChangeText={(v) => setField('industry', v)} placeholder="e.g. Technology, Finance, Healthcare" autoCapitalize="words" error={errors.industry} />
          <InputField label="Company Website" value={form.website} onChangeText={(v) => setField('website', v)} placeholder="https://yourcompany.com" keyboardType="url" autoCapitalize="none" error={errors.website} />
          <InputField label="Location" value={form.location} onChangeText={(v) => setField('location', v)} placeholder="e.g. Kingston, Jamaica" autoCapitalize="words" error={errors.location} />
        </View>

        <Button label="Create Employer Account" onPress={handleRegister} loading={loading} style={styles.submitBtn} />

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

RegisterEmployerScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing['2xl'], paddingBottom: Spacing['3xl'] },
  header: { marginBottom: Spacing.xl },
  rolePill: {
    backgroundColor: Colors.accentLight,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  rolePillText: { color: Colors.accent, fontWeight: Typography.semiBold, fontSize: Typography.sm },
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
  sectionLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  submitBtn: { marginTop: Spacing.sm, marginBottom: Spacing.base },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  loginLinkText: { fontSize: Typography.sm, color: Colors.textSecondary },
  loginLinkBold: { color: Colors.primary, fontWeight: Typography.semiBold },
});
