// src/screens/auth/RegisterStudentScreen.js
// BetterLink — Student Registration

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
import { registerStudent } from '../../api/auth';
import { Button, InputField } from '../../components';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export default function RegisterStudentScreen({ navigation }) {
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    programName: '',
    graduationYear: '',
    gpa: '',
    skills: '',
    resumeUrl: '',
    portfolioUrl: '',
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
    if (!form.university.trim()) errs.university = 'University is required.';
    if (!form.programName.trim()) errs.programName = 'Program name is required.';
    if (form.graduationYear && (isNaN(form.graduationYear) || form.graduationYear.length !== 4)) {
      errs.graduationYear = 'Enter a valid year (e.g. 2026).';
    }
    if (form.gpa && (isNaN(form.gpa) || Number(form.gpa) < 0 || Number(form.gpa) > 4)) {
      errs.gpa = 'GPA must be between 0 and 4.';
    }
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
        university: form.university.trim(),
        programName: form.programName.trim(),
        ...(form.graduationYear ? { graduationYear: parseInt(form.graduationYear, 10) } : {}),
        ...(form.gpa ? { gpa: parseFloat(form.gpa) } : {}),
        ...(form.skills ? { skills: form.skills.trim() } : {}),
        ...(form.resumeUrl ? { resumeUrl: form.resumeUrl.trim() } : {}),
        ...(form.portfolioUrl ? { portfolioUrl: form.portfolioUrl.trim() } : {}),
      };
      const res = await registerStudent(payload);
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>🎓  Student</Text>
          </View>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subHeading}>
            Join BetterLink and discover Jamaican internships and jobs.
          </Text>
        </View>

        {apiError ? (
          <View style={styles.apiBanner}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal Information</Text>
          <InputField label="Full Name *" value={form.fullName} onChangeText={(v) => setField('fullName', v)} placeholder="e.g. Keyana Matherson" error={errors.fullName} autoCapitalize="words" />
          <InputField label="Email Address *" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <InputField label="Password *" value={form.password} onChangeText={(v) => setField('password', v)} placeholder="Min 8 characters" secureTextEntry autoCapitalize="none" error={errors.password} />
          <InputField label="Confirm Password *" value={form.confirmPassword} onChangeText={(v) => setField('confirmPassword', v)} placeholder="Repeat password" secureTextEntry autoCapitalize="none" error={errors.confirmPassword} />
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Academic Details</Text>
          <InputField label="University *" value={form.university} onChangeText={(v) => setField('university', v)} placeholder="e.g. Northern Caribbean University" autoCapitalize="words" error={errors.university} />
          <InputField label="Program / Major *" value={form.programName} onChangeText={(v) => setField('programName', v)} placeholder="e.g. Computer Science" autoCapitalize="words" error={errors.programName} />
          <InputField label="Expected Graduation Year" value={form.graduationYear} onChangeText={(v) => setField('graduationYear', v)} placeholder="e.g. 2026" keyboardType="number-pad" error={errors.graduationYear} />
          <InputField label="GPA (0–4)" value={form.gpa} onChangeText={(v) => setField('gpa', v)} placeholder="e.g. 3.5" keyboardType="decimal-pad" error={errors.gpa} />
        </View>

        {/* Optional Extras */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Optional</Text>
          <InputField label="Skills (comma-separated)" value={form.skills} onChangeText={(v) => setField('skills', v)} placeholder="e.g. Python, React, SQL" error={errors.skills} />
          <InputField label="Resume URL" value={form.resumeUrl} onChangeText={(v) => setField('resumeUrl', v)} placeholder="https://drive.google.com/..." keyboardType="url" autoCapitalize="none" error={errors.resumeUrl} />
          <InputField label="Portfolio URL" value={form.portfolioUrl} onChangeText={(v) => setField('portfolioUrl', v)} placeholder="https://yourportfolio.com" keyboardType="url" autoCapitalize="none" error={errors.portfolioUrl} />
        </View>

        <Button label="Create Student Account" onPress={handleRegister} loading={loading} style={styles.submitBtn} />

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

RegisterStudentScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: Spacing['2xl'], paddingBottom: Spacing['3xl'] },
  header: { marginBottom: Spacing.xl },
  rolePill: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  rolePillText: { color: Colors.primary, fontWeight: Typography.semiBold, fontSize: Typography.sm },
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
