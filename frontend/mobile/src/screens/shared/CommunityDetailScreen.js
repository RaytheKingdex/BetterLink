// src/screens/shared/CommunityDetailScreen.js
// BetterLink — Community chat with media/document attachments

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import PropTypes from 'prop-types';
import {
  getCommunityById,
  joinCommunity,
  deleteCommunity,
  getCommunityMessages,
  postCommunityMessage,
  deleteCommunityMessage,
} from '../../api/communities';
import { BASE_URL } from '../../api/client';
import { FullScreenLoader, ErrorBanner, Badge } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Spacing, Typography } from '../../theme';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function initials(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

// ─── Attachment preview inside bubble ─────────────────────────────────────────
function AttachmentView({ url, type, mimeType, name }) {
  const fullUrl = url?.startsWith('/') ? `${BASE_URL}${url}` : url;

  if (type === 'image') {
    return (
      <Image
        source={{ uri: fullUrl }}
        style={styles.attachImage}
        resizeMode="cover"
      />
    );
  }

  if (type === 'video') {
    return (
      <View style={styles.attachVideo}>
        <Text style={styles.attachVideoIcon}>▶</Text>
        <Text style={styles.attachVideoLabel}>{name || 'Video'}</Text>
      </View>
    );
  }

  // document
  return (
    <TouchableOpacity
      style={styles.attachDoc}
      onPress={() => fullUrl && Linking.openURL(fullUrl)}
      activeOpacity={0.75}
    >
      <Text style={styles.attachDocIcon}>📄</Text>
      <Text style={styles.attachDocName} numberOfLines={1}>{name || 'Document'}</Text>
    </TouchableOpacity>
  );
}

AttachmentView.propTypes = {
  url: PropTypes.string,
  type: PropTypes.string,
  mimeType: PropTypes.string,
  name: PropTypes.string,
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, onDelete }) {
  const senderName = [message.senderFirstName, message.senderLastName].filter(Boolean).join(' ') || 'Member';

  function confirmDelete() {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this message?')) onDelete(message.id);
      return;
    }
    Alert.alert('Delete Message', 'Delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(message.id) },
    ]);
  }

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      {!isOwn && (
        <View style={styles.bubbleAvatar}>
          <Text style={styles.bubbleAvatarText}>
            {initials(message.senderFirstName, message.senderLastName)}
          </Text>
        </View>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && <Text style={styles.senderName}>{senderName}</Text>}

        {message.attachmentUrl ? (
          <AttachmentView
            url={message.attachmentUrl}
            type={message.attachmentType}
            mimeType={message.attachmentMimeType}
            name={message.attachmentName}
          />
        ) : null}

        {!!message.body && (
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{message.body}</Text>
        )}

        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{formatTime(message.createdAt)}</Text>
          {isOwn && (
            <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={styles.deleteMsgBtn}>
              <Text style={[styles.deleteMsgIcon, styles.bubbleTimeOwn]}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};

// ─── Pending attachment preview ────────────────────────────────────────────────
function AttachmentPreview({ attachment, onRemove }) {
  if (!attachment) return null;
  return (
    <View style={styles.pendingAttach}>
      {attachment.attachmentType === 'image' ? (
        <Image source={{ uri: attachment.uri }} style={styles.pendingImage} resizeMode="cover" />
      ) : (
        <View style={styles.pendingFile}>
          <Text style={styles.pendingFileIcon}>{attachment.attachmentType === 'video' ? '🎥' : '📄'}</Text>
          <Text style={styles.pendingFileName} numberOfLines={1}>{attachment.name}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onRemove} style={styles.pendingRemove} hitSlop={8}>
        <Text style={styles.pendingRemoveText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

AttachmentPreview.propTypes = {
  attachment: PropTypes.object,
  onRemove: PropTypes.func.isRequired,
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CommunityDetailScreen({ route, navigation }) {
  const { communityId } = route.params;
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [joining, setJoining] = useState(false);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [sending, setSending] = useState(false);

  const flatRef = useRef(null);

  const fetchCommunity = useCallback(async () => {
    setError('');
    try {
      const data = await getCommunityById(communityId);
      setCommunity(data);
      setIsMember(data.isMember ?? false);
      setIsCreator(data.createdByUserId === user?.userId);
    } catch (err) {
      setError(err.message || 'Could not load community.');
    }
  }, [communityId, user?.userId]);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getCommunityMessages(communityId);
      setMessages(data);
    } catch { /* not a member yet — silent */ }
  }, [communityId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCommunity(), fetchMessages()]).finally(() => setLoading(false));
  }, [fetchCommunity, fetchMessages]);

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchCommunity(), fetchMessages()]);
    setRefreshing(false);
  }

  async function handleJoin() {
    setJoining(true);
    try {
      await joinCommunity(communityId);
      setIsMember(true);
      fetchCommunity();
      fetchMessages();
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

  function confirmDeleteCommunity() {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${community?.name}"? This cannot be undone.`)) doDeleteCommunity();
      return;
    }
    Alert.alert('Delete Community', `Delete "${community?.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDeleteCommunity },
    ]);
  }

  async function doDeleteCommunity() {
    try {
      await deleteCommunity(communityId);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete community.');
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const isVideo = asset.type === 'video' || asset.mimeType?.includes('video');
      setPendingAttachment({
        uri: asset.uri,
        name: asset.fileName || (isVideo ? 'video.mp4' : 'image.jpg'),
        mimeType: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
        attachmentType: isVideo ? 'video' : 'image',
      });
    }
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setPendingAttachment({
          uri: asset.uri,
          name: asset.name || 'document',
          mimeType: asset.mimeType || 'application/octet-stream',
          attachmentType: 'document',
        });
      }
    } catch { /* cancelled */ }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text && !pendingAttachment) return;
    setSending(true);

    const optimistic = {
      id: `opt_${Date.now()}`,
      senderUserId: user?.userId,
      senderFirstName: user?.firstName || '',
      senderLastName: user?.lastName || '',
      body: text,
      attachmentUrl: pendingAttachment?.uri ?? null,
      attachmentType: pendingAttachment?.attachmentType ?? null,
      attachmentMimeType: pendingAttachment?.mimeType ?? null,
      attachmentName: pendingAttachment?.name ?? null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    const sentAttachment = pendingAttachment;
    setPendingAttachment(null);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const real = await postCommunityMessage(communityId, text, sentAttachment);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      if (err.status === 403) {
        Alert.alert('Not a Member', 'Join this community first.');
      } else {
        Alert.alert('Send Failed', err.message || 'Message could not be sent.');
      }
      setDraft(text);
      if (sentAttachment) setPendingAttachment(sentAttachment);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(messageId) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteCommunityMessage(communityId, messageId);
    } catch {
      fetchMessages(); // re-sync on failure
    }
  }

  if (loading) return <FullScreenLoader message="Loading community..." />;
  if (error) return <View style={styles.flex}><ErrorBanner message={error} onRetry={fetchCommunity} /></View>;
  if (!community) return null;

  const canSend = isMember && (draft.trim().length > 0 || pendingAttachment !== null) && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.communityHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.communityIcon}>
            <Text style={styles.communityIconText}>{(community.name || '#')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.communityName} numberOfLines={1}>{community.name}</Text>
            <Text style={styles.memberCount}>{community.memberCount} member{community.memberCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {!isMember && (
            <TouchableOpacity
              style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
              onPress={handleJoin}
              disabled={joining}
            >
              <Text style={styles.joinBtnText}>{joining ? 'Joining...' : 'Join'}</Text>
            </TouchableOpacity>
          )}
          {isMember && !isCreator && (
            <Badge label="Member" color={Colors.success} bgColor={Colors.successLight} />
          )}
          {isCreator && (
            <TouchableOpacity onPress={confirmDeleteCommunity} style={styles.deleteCommBtn} hitSlop={8}>
              <Text style={styles.deleteCommText}>🗑 Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {community.description ? (
        <View style={styles.descBanner}>
          <Text style={styles.descText} numberOfLines={2}>{community.description}</Text>
        </View>
      ) : null}

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.senderUserId === user?.userId}
            onDelete={handleDeleteMessage}
          />
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
              {isMember ? 'Be the first to post!' : 'Join this community to start chatting.'}
            </Text>
          </View>
        }
        onContentSizeChange={() => messages.length > 0 && flatRef.current?.scrollToEnd()}
      />

      {/* Input bar */}
      <View style={styles.inputArea}>
        <AttachmentPreview attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
        <View style={styles.inputBar}>
          {/* Attach buttons */}
          {isMember && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachBtns} contentContainerStyle={{ gap: 6 }}>
              <TouchableOpacity style={styles.attachBtn} onPress={pickImage} disabled={!!pendingAttachment}>
                <Text style={styles.attachBtnText}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachBtn} onPress={pickDocument} disabled={!!pendingAttachment}>
                <Text style={styles.attachBtnText}>📎</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          <TextInput
            style={styles.messageInput}
            value={draft}
            onChangeText={setDraft}
            placeholder={isMember ? 'Write a message...' : 'Join to send messages'}
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={2000}
            editable={isMember}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

CommunityDetailScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({ communityId: PropTypes.number.isRequired }).isRequired,
  }).isRequired,
  navigation: PropTypes.object.isRequired,
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  communityIcon: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  communityIconText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  communityName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  memberCount: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },

  joinBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semiBold },

  deleteCommBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.error,
  },
  deleteCommText: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.error },

  descBanner: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  descText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 18 },

  messageList: { padding: Spacing.base, paddingBottom: Spacing.sm, flexGrow: 1 },

  // Bubbles
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.sm },
  bubbleRowOwn: { justifyContent: 'flex-end' },
  bubbleAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm, marginBottom: 2,
  },
  bubbleAvatarText: { fontSize: 11, fontWeight: Typography.bold, color: Colors.primary },
  bubble: {
    maxWidth: '75%', borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1,
  },
  bubbleOther: {
    backgroundColor: Colors.surface, borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  senderName: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.primary, marginBottom: 4 },
  bubbleText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 6 },
  bubbleTime: { fontSize: 10, color: Colors.textTertiary },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },
  deleteMsgBtn: { padding: 1 },
  deleteMsgIcon: { fontSize: 12 },

  // Attachment in bubble
  attachImage: { width: 200, height: 150, borderRadius: Radius.md, marginBottom: 6 },
  attachVideo: {
    width: 200, height: 100, borderRadius: Radius.md,
    backgroundColor: '#1a1a2e',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  attachVideoIcon: { fontSize: 32, color: '#fff' },
  attachVideoLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  attachDoc: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: 6, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  attachDocIcon: { fontSize: 22 },
  attachDocName: { flex: 1, fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },

  // Pending attachment preview
  pendingAttach: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    margin: Spacing.sm, marginBottom: 0,
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  pendingImage: { width: 56, height: 56, borderRadius: Radius.sm, marginRight: Spacing.sm },
  pendingFile: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  pendingFileIcon: { fontSize: 24 },
  pendingFileName: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary },
  pendingRemove: { padding: 4 },
  pendingRemoveText: { color: Colors.error, fontWeight: Typography.bold },

  // Input area
  inputArea: { backgroundColor: Colors.surface, borderTopWidth: 1, borderColor: Colors.border },
  attachBtns: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, maxHeight: 40 },
  attachBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  attachBtnText: { fontSize: 16 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: Typography.base, color: Colors.textPrimary,
    maxHeight: 120, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: Typography.bold },

  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyChatEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyChatTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  emptyChatSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
