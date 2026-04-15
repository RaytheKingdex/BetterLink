// src/components/FollowingSidebar.js
// Slide-in sidebar: Following list + Direct Messaging

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';

import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { getFollowing, getFollowers, followUser, unfollowUser, searchUsers } from '../api/follows';
import { getThread, sendMessage, getConversations } from '../api/messages';
import { navigate } from '../navigation/navigationRef';
import { Colors, Radius, Spacing, Typography, Shadows } from '../theme';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.50;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ firstName, lastName, size = 40, color = Colors.primary }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22' }]}>
      <Text style={[styles.avatarText, { color, fontSize: size * 0.36 }]}>
        {initials(firstName, lastName)}
      </Text>
    </View>
  );
}

Avatar.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
};

// ─── Following Row ────────────────────────────────────────────────────────────
function FollowingRow({ item, onPress, onUnfollow }) {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ') || 'User';
  return (
    <TouchableOpacity style={styles.personRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatarWrap}>
        <Avatar firstName={item.firstName} lastName={item.lastName} />
        {item.hasUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.personInfo}>
        <Text style={styles.personName} numberOfLines={1}>{fullName}</Text>
        {item.lastMessagePreview ? (
          <Text style={[styles.personPreview, item.hasUnread && styles.personPreviewBold]} numberOfLines={1}>
            {item.lastMessagePreview}
          </Text>
        ) : (
          <Text style={styles.personPreviewEmpty}>No messages yet</Text>
        )}
      </View>
      <View style={styles.personMeta}>
        {item.lastMessageAt && (
          <Text style={styles.personTime}>{timeAgo(item.lastMessageAt)}</Text>
        )}
        <TouchableOpacity onPress={onUnfollow} hitSlop={8} style={styles.unfollowBtn}>
          <Text style={styles.unfollowText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

FollowingRow.propTypes = {
  item: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  onUnfollow: PropTypes.func.isRequired,
};

// ─── Search Row ───────────────────────────────────────────────────────────────
function SearchResultRow({ item, onFollow, onNavigateProfile }) {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.email;
  return (
    <TouchableOpacity style={styles.searchResultRow} onPress={() => onNavigateProfile(item)} activeOpacity={0.75}>
      <Avatar firstName={item.firstName} lastName={item.lastName} size={34} color={Colors.accent} />
      <Text style={styles.searchResultName} numberOfLines={1}>{fullName}</Text>
      {item.isFollowing ? (
        <Text style={styles.followingLabel}>Following</Text>
      ) : (
        <TouchableOpacity style={styles.followBtn} onPress={(e) => { e.stopPropagation?.(); onFollow(item); }} activeOpacity={0.8}>
          <Text style={styles.followBtnText}>+ Follow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

SearchResultRow.propTypes = {
  item: PropTypes.object.isRequired,
  onFollow: PropTypes.func.isRequired,
  onNavigateProfile: PropTypes.func.isRequired,
};


// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, myId }) {
  const isOwn = msg.senderId === myId;
  return (
    <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
      <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{msg.body}</Text>
      <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
        {timeAgo(msg.createdAt)}
      </Text>
    </View>
  );
}

Bubble.propTypes = {
  msg: PropTypes.object.isRequired,
  myId: PropTypes.number,
};

// ─── DM Thread View ───────────────────────────────────────────────────────────
function ThreadView({ contact, myId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatRef = useRef(null);

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'User';

  useEffect(() => {
    getThread(contact.userId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contact.userId]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const optimistic = {
      id: Date.now(),
      senderId: myId,
      body: text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    try {
      const real = await sendMessage(contact.userId, text);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.threadContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={20}
    >
      {/* Header */}
      <View style={styles.threadHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Avatar firstName={contact.firstName} lastName={contact.lastName} size={32} />
        <Text style={styles.threadName} numberOfLines={1}>{fullName}</Text>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.threadEmpty}>
          <Text style={styles.threadEmptyText}>Loading...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.threadEmpty}>
          <Text style={styles.threadEmptyText}>Say hi to {contact.firstName || fullName}! 👋</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => <Bubble msg={item} myId={myId} />}
          contentContainerStyle={styles.threadList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input */}
      <View style={styles.threadInput}>
        <TextInput
          style={styles.threadTextInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
          activeOpacity={0.8}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

ThreadView.propTypes = {
  contact: PropTypes.object.isRequired,
  myId: PropTypes.number,
  onBack: PropTypes.func.isRequired,
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function FollowingSidebar() {
  const { isOpen, closeSidebar, pendingContact, clearPendingContact } = useSidebar();
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const searchTimeout = useRef(null);

  // Animate open/close
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      useNativeDriver: true,
      friction: 20,
      tension: 200,
    }).start();

    if (isOpen) {
      loadFollowing();
      setSearchQuery('');
      setSearchResults([]);
      if (pendingContact) {
        setActiveContact(pendingContact);
        clearPendingContact();
      } else {
        setActiveContact(null);
      }
    }
  }, [isOpen]);

  const loadFollowing = useCallback(async () => {
    try {
      const [followingData, followersData, conversationsData] = await Promise.allSettled([
        getFollowing(),
        getFollowers(),
        getConversations(),
      ]);
      const following = followingData.status === 'fulfilled' ? followingData.value : [];
      const followers = followersData.status === 'fulfilled' ? followersData.value : [];
      const conversations = conversationsData.status === 'fulfilled' ? conversationsData.value : [];
      // Merge all three, deduplicate by userId — contacts with messages appear even if no follow
      const seen = new Set();
      const merged = [...following, ...followers, ...conversations].filter((item) => {
        if (seen.has(item.userId)) return false;
        seen.add(item.userId);
        return true;
      });
      // Sort by most recent message activity
      merged.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
      setFollowing(merged);
    } catch { /* silent */ }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  async function handleFollow(person) {
    try {
      await followUser(person.id);
      setSearchResults((prev) =>
        prev.map((p) => p.id === person.id ? { ...p, isFollowing: true } : p)
      );
      await loadFollowing();
    } catch { /* silent */ }
  }

  async function handleUnfollow(userId) {
    try {
      await unfollowUser(userId);
      setFollowing((prev) => prev.filter((f) => f.userId !== userId));
    } catch { /* silent */ }
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={closeSidebar} />
      )}

      {/* Sidebar panel */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            paddingTop: insets.top,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {activeContact ? (
          <ThreadView
            contact={activeContact}
            myId={user?.userId}
            onBack={() => setActiveContact(null)}
          />
        ) : (
          <>
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Messages</Text>
              <TouchableOpacity onPress={closeSidebar} hitSlop={12} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Find people to follow..."
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>

            {/* Search results */}
            {searchQuery.length >= 2 ? (
              <View style={styles.searchResultsSection}>
                <Text style={styles.sectionLabel}>
                  {searching ? 'Searching...' : `Results for "${searchQuery}"`}
                </Text>
                {searchResults.map((item) => (
                  <SearchResultRow
                    key={item.id}
                    item={item}
                    onFollow={handleFollow}
                    onNavigateProfile={(person) => {
                      closeSidebar();
                      navigate('UserProfile', { userId: person.id, isFollowing: person.isFollowing });
                    }}
                  />
                ))}
                {!searching && searchResults.length === 0 && (
                  <Text style={styles.emptyText}>No users found.</Text>
                )}
              </View>
            ) : (
              <>
                {/* Following list */}
                <Text style={styles.sectionLabel}>
                  {following.length > 0 ? 'FOLLOWING' : ''}
                </Text>
                {following.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>👥</Text>
                    <Text style={styles.emptyTitle}>No one yet</Text>
                    <Text style={styles.emptySubtitle}>Search for people to follow and message them directly.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={following}
                    keyExtractor={(item) => String(item.userId)}
                    renderItem={({ item }) => (
                      <FollowingRow
                        item={item}
                        onPress={() => setActiveContact(item)}
                        onUnfollow={() => handleUnfollow(item.userId)}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                  />
                )}
              </>
            )}
          </>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 100,
  },

  // Sidebar panel — dark GitHub theme
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.sidebarBg,
    zIndex: 101,
    ...Shadows.md,
    borderTopRightRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },

  // Sidebar header
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
  },
  sidebarTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.sidebarText,
  },
  closeBtn: {
    padding: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.sidebarTextSecondary,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.sidebarSurface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.sidebarBorder,
  },
  searchIcon: { fontSize: 14, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.sidebarText,
    paddingVertical: 0,
  },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.sidebarTextSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },

  // Following row
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
  },
  avatarWrap: { position: 'relative', marginRight: Spacing.md },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: Typography.bold,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.sidebarBg,
  },
  personInfo: { flex: 1, minWidth: 0 },
  personName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.sidebarText,
  },
  personPreview: {
    fontSize: Typography.xs,
    color: Colors.sidebarTextSecondary,
    marginTop: 2,
  },
  personPreviewBold: {
    color: Colors.sidebarText,
    fontWeight: Typography.semiBold,
  },
  personPreviewEmpty: {
    fontSize: Typography.xs,
    color: Colors.sidebarTextSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  personMeta: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
    gap: 4,
  },
  personTime: {
    fontSize: 10,
    color: Colors.sidebarTextSecondary,
  },
  unfollowBtn: {
    padding: 2,
  },
  unfollowText: {
    fontSize: 11,
    color: Colors.sidebarTextSecondary,
  },

  // Search results
  searchResultsSection: {
    flex: 1,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
    gap: Spacing.md,
  },
  searchResultName: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.sidebarText,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  followBtnText: {
    color: '#fff',
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
  },
  followingLabel: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontStyle: 'italic',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.sidebarText,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.sidebarTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.sidebarTextSecondary,
    paddingHorizontal: Spacing.base,
    fontStyle: 'italic',
  },

  // Thread view
  threadContainer: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarBorder,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  backIcon: {
    fontSize: 20,
    color: Colors.accent,
    fontWeight: Typography.bold,
  },
  threadName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.sidebarText,
  },
  threadEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  threadEmptyText: {
    fontSize: Typography.sm,
    color: Colors.sidebarTextSecondary,
    textAlign: 'center',
  },
  threadList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  // Message bubbles
  bubble: {
    maxWidth: '80%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: 4,
    backgroundColor: Colors.sidebarSurface,
    alignSelf: 'flex-start',
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: Typography.sm,
    color: Colors.sidebarText,
    lineHeight: 20,
  },
  bubbleTextOwn: { color: '#fff' },
  bubbleTime: {
    fontSize: 10,
    color: Colors.sidebarTextSecondary,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.65)' },

  // Thread input
  threadInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.sidebarBorder,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.sidebarSurface,
  },
  threadTextInput: {
    flex: 1,
    backgroundColor: Colors.sidebarBg,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sm,
    color: Colors.sidebarText,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
  },

});
