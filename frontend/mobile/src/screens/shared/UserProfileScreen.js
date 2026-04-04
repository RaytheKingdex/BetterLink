// src/screens/shared/UserProfileScreen.js
// BetterLink — Public profile of another user (bio + posts like Reddit)

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { getUserById, getUserPosts } from '../../api/users';
import { toggleLike } from '../../api/feed';
import { followUser, unfollowUser } from '../../api/follows';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../api/client';
import { Colors, Radius, Spacing, Typography, Shadows } from '../../theme';

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(first, last) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ─── Media thumbnail ──────────────────────────────────────────────────────────
function MediaThumb({ item, size = 110 }) {
  const uri = item.url.startsWith('/') ? `${BASE_URL}${item.url}` : item.url;
  if (item.mediaType === 'video') {
    return (
      <View style={[styles.mediaTile, { width: size, height: size }]}>
        <Text style={styles.videoIcon}>▶</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri }} style={[styles.mediaTile, { width: size, height: size }]} resizeMode="cover" />
  );
}

MediaThumb.propTypes = {
  item: PropTypes.shape({ url: PropTypes.string, mediaType: PropTypes.string }).isRequired,
  size: PropTypes.number,
};

// ─── Post card (compact Reddit style) ────────────────────────────────────────
function PostCard({ post, currentUserId, onLike }) {
  const hasMedia = post.media && post.media.length > 0;
  const gridSize = post.media?.length === 1 ? 220 : post.media?.length === 2 ? 108 : 72;

  return (
    <View style={styles.postCard}>
      <View style={styles.postMeta}>
        <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
      </View>

      {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}

      {hasMedia && (
        <View style={styles.mediaRow}>
          {post.media.map((m) => (
            <MediaThumb key={m.id} item={m} size={gridSize} />
          ))}
        </View>
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.likeBtn} onPress={() => onLike(post.id)} activeOpacity={0.7}>
          <Text style={styles.likeIcon}>{post.likedByMe ? '❤️' : '🤍'}</Text>
          {post.likeCount > 0 && (
            <Text style={[styles.likeCount, post.likedByMe && styles.likeCountActive]}>
              {post.likeCount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  currentUserId: PropTypes.number,
  onLike: PropTypes.func.isRequired,
};

// ─── Profile Hero Card (used as FlatList header) ─────────────────────────────
function ProfileHero({ profile, following, followLoading, onFollowToggle, onMessage }) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'BetterLink User';
  const role = profile.roles?.[0] ?? 'Member';
  const isStudent = role === 'Student';

  return (
    <View style={styles.heroCard}>
      <View style={[styles.avatar, isStudent ? styles.avatarStudent : styles.avatarEmployer]}>
        <Text style={styles.avatarText}>{initials(profile.firstName, profile.lastName)}</Text>
      </View>

      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.email}>{profile.email}</Text>

      <View style={[styles.rolePill, isStudent ? styles.rolePillStudent : styles.rolePillEmployer]}>
        <Text style={[styles.rolePillText, isStudent ? styles.rolePillTextStudent : styles.rolePillTextEmployer]}>
          {role}
        </Text>
      </View>

      {profile.displayId ? (
        <Text style={styles.displayId}>ID {profile.displayId.slice(0, 4)}****</Text>
      ) : null}

      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageBtn} onPress={onMessage} activeOpacity={0.8}>
          <Text style={styles.messageBtnText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.followBtn, following ? styles.followBtnActive : styles.followBtnInactive]}
          onPress={onFollowToggle}
          disabled={followLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.followBtnText, following ? styles.followBtnTextActive : styles.followBtnTextInactive]}>
            {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsHeader}>
        <Text style={styles.postsHeaderText}>POSTS</Text>
      </View>
    </View>
  );
}

ProfileHero.propTypes = {
  profile: PropTypes.object.isRequired,
  following: PropTypes.bool.isRequired,
  followLoading: PropTypes.bool.isRequired,
  onFollowToggle: PropTypes.func.isRequired,
  onMessage: PropTypes.func.isRequired,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UserProfileScreen({ route }) {
  const { userId, isFollowing: initialFollowing = false } = route.params;
  const { openWithContact } = useSidebar();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [following, setFollowing] = useState(initialFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = React.useRef(1);

  useEffect(() => {
    getUserById(userId)
      .then(setProfile)
      .catch((err) => setProfileError(err.message || 'Failed to load profile.'))
      .finally(() => setProfileLoading(false));
  }, [userId]);

  const fetchPosts = useCallback(async (p, append = false) => {
    try {
      const data = await getUserPosts(userId, p, PAGE_SIZE);
      if (append) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch { /* silent */ }
  }, [userId]);

  useEffect(() => {
    pageRef.current = 1;
    fetchPosts(1, false).finally(() => setPostsLoading(false));
  }, [fetchPosts]);

  async function handleRefresh() {
    setRefreshing(true);
    pageRef.current = 1;
    await fetchPosts(1, false);
    setRefreshing(false);
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = pageRef.current + 1;
    pageRef.current = next;
    await fetchPosts(next, true);
    setLoadingMore(false);
  }

  async function handleFollowToggle() {
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
      } else {
        await followUser(userId);
        setFollowing(true);
      }
    } catch { /* silent */ }
    finally { setFollowLoading(false); }
  }

  async function handleLike(postId) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nowLiked = !p.likedByMe;
        return { ...p, likedByMe: nowLiked, likeCount: p.likeCount + (nowLiked ? 1 : -1) };
      })
    );
    try {
      const result = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p)
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const reverted = !p.likedByMe;
          return { ...p, likedByMe: reverted, likeCount: p.likeCount + (reverted ? 1 : -1) };
        })
      );
    }
  }

  function handleMessage() {
    if (!profile) return;
    openWithContact({ userId: profile.userId, firstName: profile.firstName, lastName: profile.lastName });
  }

  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{profileError || 'User not found.'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <PostCard post={item} currentUserId={currentUser?.userId} onLike={handleLike} />
      )}
      ListHeaderComponent={
        <ProfileHero
          profile={profile}
          following={following}
          followLoading={followLoading}
          onFollowToggle={handleFollowToggle}
          onMessage={handleMessage}
        />
      }
      ListEmptyComponent={
        postsLoading ? (
          <ActivityIndicator style={styles.postsLoader} color={Colors.primary} />
        ) : (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsEmoji}>📭</Text>
            <Text style={styles.emptyPostsText}>No posts yet.</Text>
          </View>
        )
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={styles.postsLoader} color={Colors.primary} /> : null
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
    />
  );
}

UserProfileScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.number.isRequired,
      isFollowing: PropTypes.bool,
    }).isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  errorEmoji: { fontSize: 40 },
  errorText: { fontSize: Typography.base, color: Colors.textSecondary },

  listContent: { paddingBottom: Spacing['3xl'], backgroundColor: Colors.background },

  // ── Hero card ──────────────────────────────────────────────────────────────
  heroCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingTop: Spacing['2xl'],
    paddingBottom: 0,
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarStudent: { backgroundColor: Colors.primary },
  avatarEmployer: { backgroundColor: Colors.accent },
  avatarText: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: '#fff' },

  name: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  email: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  displayId: { fontSize: Typography.xs, color: Colors.textTertiary, letterSpacing: 1, marginTop: 2 },

  rolePill: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, marginTop: Spacing.sm },
  rolePillStudent: { backgroundColor: Colors.primaryLight },
  rolePillEmployer: { backgroundColor: Colors.accentLight },
  rolePillText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  rolePillTextStudent: { color: Colors.primary },
  rolePillTextEmployer: { color: Colors.accent },

  bio: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    width: '100%',
  },
  messageBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  messageBtnText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semiBold },

  followBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  followBtnInactive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  followBtnActive: { borderColor: Colors.border, backgroundColor: Colors.surface },
  followBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  followBtnTextInactive: { color: Colors.primary },
  followBtnTextActive: { color: Colors.textSecondary },

  postsHeader: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  postsHeaderText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },

  // ── Post card ──────────────────────────────────────────────────────────────
  postCard: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  postMeta: { marginBottom: Spacing.xs },
  postTime: { fontSize: Typography.xs, color: Colors.textTertiary },
  postContent: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  mediaTile: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: { fontSize: 24, color: '#fff' },

  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  likeIcon: { fontSize: 16 },
  likeCount: { fontSize: Typography.sm, color: Colors.textTertiary },
  likeCountActive: { color: Colors.error },

  postsLoader: { paddingVertical: Spacing['2xl'] },
  emptyPosts: { alignItems: 'center', paddingTop: Spacing['3xl'] },
  emptyPostsEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  emptyPostsText: { fontSize: Typography.sm, color: Colors.textSecondary },
});
