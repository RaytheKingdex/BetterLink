// src/screens/shared/FeedScreen.js
// BetterLink — Social Feed

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import PropTypes from 'prop-types';
import { getFeed, createPost, toggleLike, deletePost, getComments, addComment, deleteComment } from '../../api/feed';
import { BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { navigate } from '../../navigation/navigationRef';
import { LoadingSpinner, EmptyState, ErrorBanner } from '../../components';
import { Colors, Radius, Spacing, Shadows, Typography } from '../../theme';

const PAGE_SIZE = 20;
const MAX_MEDIA = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPostDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function initials(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  return '?';
}

// ─── Media Thumbnail (in PostCard) ───────────────────────────────────────────
function MediaThumb({ item, size = 120 }) {
  const uri = item.url.startsWith('/') ? `${BASE_URL}${item.url}` : item.url;
  if (item.mediaType === 'video') {
    return (
      <View style={[styles.mediaTile, { width: size, height: size }]}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>▶</Text>
          <Text style={styles.videoLabel}>Video</Text>
        </View>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={[styles.mediaTile, { width: size, height: size }]}
      resizeMode="cover"
    />
  );
}

MediaThumb.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    url: PropTypes.string,
    mediaType: PropTypes.string,
    mimeType: PropTypes.string,
  }).isRequired,
  size: PropTypes.number,
};

// ─── Media Grid (in PostCard) ─────────────────────────────────────────────────
function MediaGrid({ media }) {
  if (!media || media.length === 0) return null;
  const count = media.length;
  const singleSize = 240;
  const gridSize = count === 2 ? 118 : 78;

  if (count === 1) {
    return (
      <View style={styles.mediaContainer}>
        <MediaThumb item={media[0]} size={singleSize} />
      </View>
    );
  }

  return (
    <View style={styles.mediaContainer}>
      <View style={styles.mediaGrid}>
        {media.map((item) => (
          <MediaThumb key={item.id} item={item} size={gridSize} />
        ))}
      </View>
    </View>
  );
}

MediaGrid.propTypes = {
  media: PropTypes.array,
};

// ─── Comment Sheet ────────────────────────────────────────────────────────────
function CommentSheet({ postId, currentUserId, visible, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = React.useRef(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, postId]);

  async function handleSubmit() {
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    const optimistic = {
      id: `opt_${Date.now()}`,
      authorId: currentUserId,
      authorFirstName: '',
      authorLastName: '',
      body: text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    try {
      const real = await addComment(postId, text);
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? real : c)));
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(comment) {
    const doDelete = async () => {
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      try { await deleteComment(postId, comment.id); }
      catch { getComments(postId).then(setComments).catch(() => {}); }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this comment?')) doDelete();
      return;
    }
    Alert.alert('Delete Comment', 'Delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.sheetFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Comments</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.sheetClose}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.sheetEmpty}>
            <Text style={styles.sheetEmptyText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={styles.commentList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>No comments yet. Be the first!</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isOwn = item.authorId === currentUserId;
              const name = [item.authorFirstName, item.authorLastName].filter(Boolean).join(' ') || 'User';
              return (
                <View style={styles.commentRow}>
                  <View style={[styles.commentAvatar, isOwn && styles.commentAvatarOwn]}>
                    <Text style={[styles.commentAvatarText, isOwn && styles.commentAvatarTextOwn]}>
                      {initials(item.authorFirstName, item.authorLastName)}
                    </Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{isOwn ? 'You' : name}</Text>
                    <Text style={styles.commentBody}>{item.body}</Text>
                    <Text style={styles.commentTime}>{formatPostDate(item.createdAt)}</Text>
                  </View>
                  {isOwn && (
                    <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8} style={styles.commentDelete}>
                      <Text style={styles.commentDeleteIcon}>🗑</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View style={styles.sheetInput}>
          <TextInput
            style={styles.sheetTextInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a comment..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sheetSendBtn, (!draft.trim() || submitting) && styles.sheetSendBtnDisabled]}
            onPress={handleSubmit}
            disabled={!draft.trim() || submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.sheetSendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

CommentSheet.propTypes = {
  postId: PropTypes.number.isRequired,
  currentUserId: PropTypes.number,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, onLike, onDelete, onComment }) {
  const isOwn = post.authorId === currentUserId;
  const authorName = [post.authorFirstName, post.authorLastName].filter(Boolean).join(' ') || 'User';

  function confirmDelete() {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this post? This cannot be undone.')) onDelete(post.id);
      return;
    }
    Alert.alert('Delete Post', 'Delete this post? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(post.id) },
    ]);
  }

  function goToProfile() {
    if (isOwn) return; // own profile is the Profile tab
    navigate('UserProfile', { userId: post.authorId, isFollowing: false });
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.authorRow} onPress={goToProfile} activeOpacity={isOwn ? 1 : 0.7}>
          <View style={[styles.avatar, isOwn && styles.avatarOwn]}>
            <Text style={[styles.avatarText, isOwn && styles.avatarTextOwn]}>
              {initials(post.authorFirstName, post.authorLastName)}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.timestamp}>{formatPostDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        {isOwn && (
          <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={styles.deletePostBtn}>
            <Text style={styles.deletePostIcon}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!post.content && <Text style={styles.content}>{post.content}</Text>}

      <MediaGrid media={post.media} />

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.likeBtn} onPress={() => onLike(post.id)} activeOpacity={0.7}>
          <Text style={styles.likeIcon}>{post.likedByMe ? '❤️' : '🤍'}</Text>
          <Text style={[styles.likeCount, post.likedByMe && styles.likeCountActive]}>
            {post.likeCount > 0 ? post.likeCount : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentBtn} onPress={() => onComment(post.id)} activeOpacity={0.7}>
          <Text style={styles.commentBtnIcon}>💬</Text>
          <Text style={styles.commentBtnCount}>
            {post.commentCount > 0 ? post.commentCount : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    authorId: PropTypes.number,
    authorFirstName: PropTypes.string,
    authorLastName: PropTypes.string,
    likeCount: PropTypes.number,
    likedByMe: PropTypes.bool,
    media: PropTypes.array,
  }).isRequired,
  currentUserId: PropTypes.number,
  onLike: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onComment: PropTypes.func.isRequired,
};

// ─── Draft Media Preview (in ComposeBox) ─────────────────────────────────────
function DraftMediaRow({ assets, onRemove }) {
  if (assets.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.draftRow}>
      {assets.map((asset, i) => (
        <View key={asset.uri} style={styles.draftTile}>
          {asset.type === 'video' ? (
            <View style={[styles.draftThumb, styles.draftVideoThumb]}>
              <Text style={styles.videoIcon}>▶</Text>
            </View>
          ) : (
            <Image source={{ uri: asset.uri }} style={styles.draftThumb} resizeMode="cover" />
          )}
          <TouchableOpacity style={styles.draftRemove} onPress={() => onRemove(i)} hitSlop={8}>
            <Text style={styles.draftRemoveText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

DraftMediaRow.propTypes = {
  assets: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};

// ─── Compose Box ──────────────────────────────────────────────────────────────
function ComposeBox({ onPost }) {
  const [text, setText] = useState('');
  const [draftMedia, setDraftMedia] = useState([]);
  const [posting, setPosting] = useState(false);

  async function pickMedia() {
    if (draftMedia.length >= MAX_MEDIA) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA - draftMedia.length,
      quality: 0.85,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setDraftMedia((prev) => {
        const combined = [...prev, ...result.assets];
        return combined.slice(0, MAX_MEDIA);
      });
    }
  }

  function removeMedia(index) {
    setDraftMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePost() {
    const trimmed = text.trim();
    if ((!trimmed && draftMedia.length === 0) || posting) return;
    setPosting(true);
    try {
      const newPost = await onPost(trimmed, draftMedia);
      if (newPost) {
        setText('');
        setDraftMedia([]);
      }
    } finally {
      setPosting(false);
    }
  }

  const canPost = (text.trim().length > 0 || draftMedia.length > 0) && !posting;

  return (
    <View style={styles.composeBox}>
      <TextInput
        style={styles.composeInput}
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        placeholderTextColor={Colors.textTertiary}
        multiline
        maxLength={1000}
      />

      <DraftMediaRow assets={draftMedia} onRemove={removeMedia} />

      <View style={styles.composeActions}>
        <TouchableOpacity
          style={[styles.attachBtn, draftMedia.length >= MAX_MEDIA && styles.attachBtnDisabled]}
          onPress={pickMedia}
          disabled={draftMedia.length >= MAX_MEDIA}
          activeOpacity={0.7}
        >
          <Text style={styles.attachIcon}>📎</Text>
          <Text style={styles.attachLabel}>
            {draftMedia.length > 0 ? `${draftMedia.length}/${MAX_MEDIA}` : 'Attach'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={!canPost}
          activeOpacity={0.8}
        >
          {posting ? (
            <LoadingSpinner size="small" color={Colors.surface} />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

ComposeBox.propTypes = {
  onPost: PropTypes.func.isRequired,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [commentPostId, setCommentPostId] = useState(null);
  const page = useRef(1);

  const fetchPosts = useCallback(async (p, append = false) => {
    try {
      const data = await getFeed({ page: p, pageSize: PAGE_SIZE });
      if (append) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(data.length === PAGE_SIZE);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load feed.');
      setHasMore(false);
    }
  }, []);

  useEffect(() => {
    page.current = 1;
    fetchPosts(1, false).finally(() => setLoading(false));
  }, [fetchPosts]);

  async function handleRefresh() {
    setRefreshing(true);
    page.current = 1;
    await fetchPosts(1, false);
    setRefreshing(false);
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page.current + 1;
    page.current = next;
    await fetchPosts(next, true);
    setLoadingMore(false);
  }

  async function handlePost(content, mediaAssets) {
    try {
      const newPost = await createPost(content, mediaAssets);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err.message || 'Failed to create post.');
      return null;
    }
  }

  async function handleDelete(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await deletePost(postId);
    } catch {
      // re-fetch on failure so list stays accurate
      fetchPosts(1, false);
    }
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
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: result.liked, likeCount: result.likeCount } : p
        )
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {error ? (
        <ErrorBanner
          message={error}
          onRetry={() => {
            setLoading(true);
            page.current = 1;
            fetchPosts(1, false).finally(() => setLoading(false));
          }}
        />
      ) : null}

      {loading ? (
        <LoadingSpinner style={styles.loader} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user?.userId}
              onLike={handleLike}
              onDelete={handleDelete}
              onComment={(id) => setCommentPostId(id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={<ComposeBox onPost={handlePost} />}
          ListEmptyComponent={
            <EmptyState
              emoji="📣"
              title="Nothing here yet"
              subtitle="Be the first to post something!"
            />
          }
          ListFooterComponent={
            loadingMore ? <LoadingSpinner size="small" style={styles.footerLoader} /> : null
          }
        />
      )}

      {commentPostId !== null && (
        <CommentSheet
          postId={commentPostId}
          currentUserId={user?.userId}
          visible={commentPostId !== null}
          onClose={() => setCommentPostId(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: Spacing['3xl'] },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  footerLoader: { paddingVertical: Spacing.lg },

  // ── Compose Box ──────────────────────────────────────────────────────────────
  composeBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  composeInput: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  composeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  attachBtnDisabled: { opacity: 0.4 },
  attachIcon: { fontSize: 16 },
  attachLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.45 },
  postBtnText: {
    color: Colors.surface,
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },

  // ── Draft media row ───────────────────────────────────────────────────────────
  draftRow: {
    marginBottom: Spacing.sm,
  },
  draftTile: {
    marginRight: Spacing.sm,
    position: 'relative',
  },
  draftThumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
  },
  draftVideoThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.textTertiary,
  },
  draftRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftRemoveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },

  // ── Post Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarOwn: { backgroundColor: Colors.accentLight ?? '#D6F5ED' },
  avatarText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  avatarTextOwn: { color: Colors.accent },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  content: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  likeIcon: { fontSize: 18, marginRight: 4 },
  likeCount: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    minWidth: 16,
  },
  likeCountActive: { color: Colors.error },

  deletePostBtn: { padding: 4, marginLeft: Spacing.sm },
  deletePostIcon: { fontSize: 16 },

  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginLeft: Spacing.base,
  },
  commentBtnIcon: { fontSize: 18, marginRight: 4 },
  commentBtnCount: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    minWidth: 16,
  },

  // ── Comment Sheet ─────────────────────────────────────────────────────────────
  sheetFlex: { flex: 1, backgroundColor: Colors.surface },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  sheetClose: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  sheetEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  sheetEmptyText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  commentList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  commentAvatarOwn: { backgroundColor: Colors.accentLight ?? '#D6F5ED' },
  commentAvatarText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  commentAvatarTextOwn: { color: Colors.accent },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  commentAuthor: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  commentBody: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  commentDelete: {
    paddingLeft: Spacing.sm,
    paddingTop: 4,
  },
  commentDeleteIcon: { fontSize: 14 },
  sheetInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  sheetTextInput: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sheetSendBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSendBtnDisabled: { opacity: 0.4 },
  sheetSendText: { color: '#fff', fontSize: 14 },

  // ── Media grid (in post card) ─────────────────────────────────────────────────
  mediaContainer: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderRadius: Radius.md,
  },
  mediaTile: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  videoIcon: {
    fontSize: 28,
    color: '#fff',
  },
  videoLabel: {
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});
