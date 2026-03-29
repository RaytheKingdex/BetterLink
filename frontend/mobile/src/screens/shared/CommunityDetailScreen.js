// src/screens/shared/CommunityDetailScreen.js
// BetterLink - Community Detail + Messaging

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getCommunityById, joinCommunity, postCommunityMessage } from '../../api/communities';
import { FullScreenLoader, ErrorBanner, Badge } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Spacing, Typography } from '../../theme';

// Mock messages (backend doesn't expose GET /messages yet)
// In production, replace with a real GET endpoint once the team adds it.
// For now we optimistically render sent messages in local state.

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-JM', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message, isOwn }) {
  return (
    <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
      {!isOwn && (
        <Text style={styles.senderName}>{message.sender || 'Member'}</Text>
      )}
      <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
        {message.body}
      </Text>
      <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.shape({
    body: PropTypes.string,
    sender: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  isOwn: PropTypes.bool,
};

export default function CommunityDetailScreen({ route }) {
  const { communityId } = route.params;
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const flatRef = useRef(null);

  const fetchCommunity = useCallback(async () => {
    setError('');
    try {
      const data = await getCommunityById(communityId);
      setCommunity(data);
    } catch (err) {
      setError(err.message || 'Could not load community.');
    }
  }, [communityId]);

  useEffect(() => {
    setLoading(true);
    fetchCommunity().finally(() => setLoading(false));
  }, [fetchCommunity]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchCommunity();
    setRefreshing(false);
  }

  async function handleJoin() {
    setJoining(true);
    try {
      await joinCommunity(communityId);
      setIsMember(true);
      Alert.alert('Joined!', 'You are now a member of this community.');
      fetchCommunity();
    } catch (err) {
      if (err.status === 409) {
        setIsMember(true);
      } else {
        Alert.alert('Error', err.message || 'Could not join community.');
      }
    } finally {
      setJoining(false);
    }
  }

  async function handleSend() {
    if (!draft.trim()) return;
    const msgBody = draft.trim();
    setDraft('');
    setSending(true);

    const tempMsg = {
      id: Date.now(),
      body: msgBody,
      sender: user?.firstName || user?.email || 'You',
      createdAt: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await postCommunityMessage(communityId, { body: msgBody });
    } catch (err) {
      if (err.status === 403) {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        Alert.alert('Not a Member', 'Join this community first to send messages.');
      } else {
        Alert.alert('Send Failed', err.message || 'Message could not be sent.');
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <FullScreenLoader message="Loading community..." />;
  if (error) return <View style={styles.flex}><ErrorBanner message={error} onRetry={fetchCommunity} /></View>;
  if (!community) return null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.communityHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.communityIcon}>
            <Text style={styles.communityIconText}>
              {(community.name || '#')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
            <Text style={styles.memberCount}>{community.memberCount} member{community.memberCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        {!isMember && (
          <TouchableOpacity
            style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={joining}
          >
            <Text style={styles.joinBtnText}>{joining ? 'Joining...' : 'Join'}</Text>
          </TouchableOpacity>
        )}
        {isMember && (
          <Badge label="Member" color={Colors.success} bgColor={Colors.successLight} />
        )}
      </View>

      {community.description ? (
        <View style={styles.descBanner}>
          <Text style={styles.descText} numberOfLines={2}>{community.description}</Text>
        </View>
      ) : null}

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.isOwn} />
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>💬</Text>
            <Text style={styles.emptyChatTitle}>No messages yet</Text>
            <Text style={styles.emptyChatSub}>
              {isMember
                ? 'Be the first to post in this community!'
                : 'Join this community to start chatting.'}
            </Text>
          </View>
        }
        onContentSizeChange={() => messages.length > 0 && flatRef.current?.scrollToEnd()}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.messageInput}
          value={draft}
          onChangeText={setDraft}
          placeholder={isMember ? 'Write a message...' : 'Join to send messages'}
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={500}
          editable={isMember}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!draft.trim() || sending || !isMember) && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!draft.trim() || sending || !isMember}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

CommunityDetailScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({ communityId: PropTypes.number.isRequired }).isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.md },
  communityIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  communityIconText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  communityName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  memberCount: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semiBold },

  descBanner: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  descText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 18 },

  messageList: {
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
    flexGrow: 1,
  },

  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: 4,
    borderColor: Colors.primary,
  },
  senderName: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.primary, marginBottom: 4 },
  bubbleText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, textAlign: 'right' },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },

  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyChatEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyChatTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  emptyChatSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: Typography.bold },
});
