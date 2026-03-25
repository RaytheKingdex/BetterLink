// src/components/index.js
// Reusable UI primitives for BetterLink Mobile

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Colors, Radius, Spacing, Typography } from '../theme';

// ─── LoadingSpinner ────────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'large', color = Colors.primary, style }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'large']),
  color: PropTypes.string,
  style: PropTypes.object,
};

// ─── FullScreenLoader ─────────────────────────────────────────────────────────
export function FullScreenLoader({ message }) {
  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.loaderText}>{message}</Text>}
    </View>
  );
}
FullScreenLoader.propTypes = {
  message: PropTypes.string,
};

// ─── ErrorBanner ──────────────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
ErrorBanner.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

// ─── InlineError ──────────────────────────────────────────────────────────────
export function InlineError({ message }) {
  if (!message) return null;
  return <Text style={styles.inlineError}>{message}</Text>;
}
InlineError.propTypes = {
  message: PropTypes.string,
};

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const containerStyle = [
    styles.btn,
    isPrimary && styles.btnPrimary,
    isOutline && styles.btnOutline,
    isDanger && styles.btnDanger,
    isGhost && styles.btnGhost,
    (disabled || loading) && styles.btnDisabled,
    style,
  ];

  const textStyle = [
    styles.btnText,
    isPrimary && styles.btnTextPrimary,
    isOutline && styles.btnTextOutline,
    isDanger && styles.btnTextDanger,
    isGhost && styles.btnTextGhost,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary || isDanger ? '#fff' : Colors.primary}
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'outline', 'danger', 'ghost']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

// ─── InputField ───────────────────────────────────────────────────────────────
export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  editable,
}) {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          multiline && { height: (numberOfLines || 3) * 24, textAlignVertical: 'top' },
          editable === false && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}
InputField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  editable: PropTypes.bool,
};

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = Colors.primary, bgColor = Colors.primaryLight }) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}
Badge.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
  bgColor: PropTypes.string,
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}
Card.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  onPress: PropTypes.func,
};

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.string,
  onAction: PropTypes.func,
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, subtitle, action, onAction }) {
  return (
    <View style={styles.emptyState}>
      {emoji && <Text style={styles.emptyEmoji}>{emoji}</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <Button label={action} onPress={onAction} style={styles.emptyAction} />
      )}
    </View>
  );
}
EmptyState.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  loaderText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  // Error Banner
  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { color: Colors.error, fontSize: Typography.sm, flex: 1 },
  retryBtn: { marginLeft: Spacing.sm },
  retryText: {
    color: Colors.error,
    fontWeight: Typography.semiBold,
    fontSize: Typography.sm,
  },
  inlineError: {
    color: Colors.error,
    fontSize: Typography.xs,
    marginTop: Spacing.xs,
  },

  // Button
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnPrimary: { backgroundColor: Colors.primary },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnDanger: { backgroundColor: Colors.error },
  btnGhost: { backgroundColor: 'transparent' },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontSize: Typography.base, fontWeight: Typography.semiBold },
  btnTextPrimary: { color: '#fff' },
  btnTextOutline: { color: Colors.primary },
  btnTextDanger: { color: '#fff' },
  btnTextGhost: { color: Colors.primary },

  // Input
  inputWrapper: { marginBottom: Spacing.md },
  inputLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 48,
  },
  inputError: { borderColor: Colors.error },
  inputDisabled: { backgroundColor: Colors.borderLight, color: Colors.textTertiary },
  inputErrorText: { color: Colors.error, fontSize: Typography.xs, marginTop: 4 },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['3xl'],
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: { marginTop: Spacing.lg, minWidth: 160 },
});
