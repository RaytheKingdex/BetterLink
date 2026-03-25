// src/screens/auth/LoginScreen.js
// BetterLink — Login

import React, { useState } from 'react';
import {
  Image,
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
import { login } from '../../api/auth';
import { Button, InputField, InlineError } from '../../components';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  }

  async function handleLogin() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await login(form.email.trim(), form.password);
      await signIn(res);
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
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
        {/* Logo / Hero */}
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>B</Text>
          </View>
          <Text style={styles.appName}>BetterLink</Text>
          <Text style={styles.tagline}>
            Jamaica's student-employer platform
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subHeading}>Sign in to your account</Text>

          {apiError ? (
            <View style={styles.apiBanner}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <InputField
            label="Email address"
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <InputField
            label="Password"
            value={form.password}
            onChangeText={(v) => setField('password', v)}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Register links */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <View style={styles.registerRow}>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterStudent')}
            >
              <Text style={styles.registerLinkText}>Register as Student</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>·</Text>
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterEmployer')}
            >
              <Text style={styles.registerLinkText}>Register as Employer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  hero: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: Typography.bold,
    color: '#fff',
  },
  appName: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  heading: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  apiBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  apiErrorText: { color: Colors.error, fontSize: Typography.sm },
  submitBtn: { marginTop: Spacing.sm },
  footer: { alignItems: 'center' },
  footerText: { fontSize: Typography.sm, color: Colors.textSecondary },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  registerLink: { padding: Spacing.xs },
  registerLinkText: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },
  divider: {
    color: Colors.textTertiary,
    marginHorizontal: Spacing.xs,
    fontSize: Typography.base,
  },
});
