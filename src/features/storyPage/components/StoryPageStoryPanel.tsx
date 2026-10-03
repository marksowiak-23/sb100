/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, Calendar, Clock, MapPin, Users, ArrowLeft, BookOpen, Sparkles,
  ThumbsUp, MessageSquare, Send, CornerDownRight, X, MessageCircle, Loader2,
  Reply, Pencil, Trash2, Check, ChevronDown
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { resolveMediaUrl, taskApi, MbrStoryLikes, MbrStoryComments } from '@/src/services/api';
import StoryAudioPlayer from '@/src/components/StoryAudioPlayer';

export interface StoryPageStoryPanelProps {
  storyId?: string | null;
  storyTitle?: string;
  storyContent?: string;
  storyTopic?: string;
  publishedDate?: string;
  authorName?: string;
  authorLocation?: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  connectionGrpName?: string;
  onClickBack?: () => void;
  onClickViewAuthorStorybook?: () => void;
}

const topicBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  family: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
  sbmbrstryfamly: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
  relationships: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40' },
  relationship: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40' },
  sbmbrstryrelationships: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40' },
  sbmbrstryrelationship: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40' },
  residencies: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40' },
  sbmbrstryresidence: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40' },
  achievements: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40' },
  sbmbrstryachievement: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40' },
  education: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40' },
  sbmbrstryeducation: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40' },
  employment: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40' },
  sbmbrstryemployment: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40' },
  hobbies: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  activities: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  sbmbrstryactivity: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  other: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
  custom: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
  sbmbrstrycustom: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
};

const formatTopicName = (typeCd?: string): string => {
  if (!typeCd) return 'Story Chapter';
  const clean = typeCd.toLowerCase().replace('sbmbrstry', '').replace('mbrstry', '');
  if (clean === 'famly' || clean === 'family') return 'Family';
  if (clean === 'relationships' || clean === 'relationship') return 'Relationships';
  if (clean === 'residence' || clean === 'residencies') return 'Residencies';
  if (clean === 'achievement' || clean === 'achievements') return 'Achievements';
  if (clean === 'education') return 'Education';
  if (clean === 'employment' || clean === 'career') return 'Employment';
  if (clean === 'activity' || clean === 'activities' || clean === 'hobbies') return 'Hobbies & Activities';
  if (clean === 'custom' || clean === 'other') return 'Custom Topic';
  return typeCd.charAt(0).toUpperCase() + typeCd.slice(1);
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recently Published';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {}
  return dateStr;
};

const formatCommentTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {}
  return dateStr;
};

interface ReactionConfig {
  code: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  badgeColor: string;
}

const REACTION_CONFIGS: Record<string, ReactionConfig> = {
  Like: {
    code: 'Like',
    label: 'Like',
    emoji: '👍',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/60',
    badgeColor: 'bg-blue-500 text-white'
  },
  Love: {
    code: 'Love',
    label: 'Love',
    emoji: '❤️',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    hoverColor: 'hover:bg-rose-100 dark:hover:bg-rose-900/60',
    badgeColor: 'bg-rose-500 text-white'
  },
  Care: {
    code: 'Care',
    label: 'Care',
    emoji: '🥰',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/60',
    badgeColor: 'bg-amber-500 text-white'
  },
  HaHa: {
    code: 'HaHa',
    label: 'HaHa',
    emoji: '😆',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
    hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/60',
    badgeColor: 'bg-yellow-500 text-white'
  },
  Wow: {
    code: 'Wow',
    label: 'Wow',
    emoji: '😮',
    color: 'text-amber-500 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/60',
    badgeColor: 'bg-amber-500 text-white'
  },
  Sad: {
    code: 'Sad',
    label: 'Sad',
    emoji: '😢',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/60',
    badgeColor: 'bg-indigo-500 text-white'
  },
  Angry: {
    code: 'Angry',
    label: 'Angry',
    emoji: '😡',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/60',
    badgeColor: 'bg-red-600 text-white'
  }
};

const ORDERED_REACTIONS = ['Like', 'Love', 'Care', 'HaHa', 'Wow', 'Sad', 'Angry'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getLoggedInMemberInfo = (): { mbrId: string; mbrName: string } => {
  let mbrId = '';
  let mbrName = '';

  const storedMbr = sessionStorage.getItem('sb_current_mbr') || sessionStorage.getItem('mbr') || sessionStorage.getItem('sandbox_mbr');
  if (storedMbr) {
    try {
      const m = JSON.parse(storedMbr);
      if (m.mbrId) mbrId = m.mbrId;
      const full = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim();
      if (full) mbrName = full;
    } catch {}
  }

  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (!mbrId && u.mbrId) mbrId = u.mbrId;
      if (!mbrName) {
        if (u.first_name || u.last_name) {
          mbrName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        } else if (u.email) {
          mbrName = u.email.split('@')[0];
        }
      }
    } catch {}
  }

  return { 
    mbrId: mbrId || '299da1e4-a233-4333-ab7c-b9ca64b6b7d4', 
    mbrName: mbrName || 'Mark Sowiak' 
  };
};

export interface CommentTreeNode {
  comment: MbrStoryComments;
  children: CommentTreeNode[];
}

interface CommentThreadItemProps {
  key?: React.Key;
  node: CommentTreeNode;
  depth?: number;
  onReply: (comment: MbrStoryComments) => void;
  onUpdateComment: (commentId: string, newContent: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  formatTime: (dt?: string) => string;
  commentMap: Map<string, MbrStoryComments>;
  activeReplyCommentId?: string | null;
  loggedInMbrId?: string;
  loggedInMbrName?: string;
}

function CommentThreadItem({
  node,
  depth = 0,
  onReply,
  onUpdateComment,
  onDeleteComment,
  formatTime,
  commentMap,
  activeReplyCommentId,
  loggedInMbrId,
  loggedInMbrName,
}: CommentThreadItemProps) {
  const { comment, children } = node;
  const parentComment = comment.mbrCommentsParentId ? commentMap.get(comment.mbrCommentsParentId) : null;
  const isRoot = depth === 0;
  const [isExpanded, setIsExpanded] = useState(false);

  // Edit / Delete Local States
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.mbrCommentsContent);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Author verification
  const isAuthor = Boolean(
    (loggedInMbrId && comment.mbrCommentsMbrId && comment.mbrCommentsMbrId === loggedInMbrId) ||
    (!comment.mbrCommentsMbrId && loggedInMbrName && comment.mbrCommentsMbrName && comment.mbrCommentsMbrName === loggedInMbrName)
  );

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateComment(comment.mbrCommentsId, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteComment(comment.mbrCommentsId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setIsDeleting(false);
    }
  };

  // Compute total nested replies under this node
  const totalReplies = useMemo(() => {
    const countNodeReplies = (currNode: CommentTreeNode): number => {
      let cnt = currNode.children.length;
      for (const ch of currNode.children) {
        cnt += countNodeReplies(ch);
      }
      return cnt;
    };
    return countNodeReplies(node);
  }, [node]);

  // Auto-expand if active reply targets this comment or one of its descendants
  useEffect(() => {
    if (activeReplyCommentId && isRoot) {
      const isTargetInNode = (n: CommentTreeNode): boolean => {
        if (n.comment.mbrCommentsId === activeReplyCommentId) return true;
        return n.children.some(isTargetInNode);
      };
      if (isTargetInNode(node)) {
        setIsExpanded(true);
      }
    }
  }, [activeReplyCommentId, isRoot, node]);

  const avatarGradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-indigo-600',
    'from-teal-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];
  const avatarGradient = avatarGradients[depth % avatarGradients.length];

  return (
    <div
      className={
        isRoot
          ? 'bg-slate-50/80 dark:bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-750/80 space-y-1 shadow-2xs'
          : 'bg-white/80 dark:bg-slate-900/80 rounded-md px-2 py-1 border border-slate-200/60 dark:border-slate-800 space-y-0.5 shadow-2xs'
      }
    >
      {/* Header with avatar, author name, replying-to metadata, timestamp & actions */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`${
              isRoot ? 'w-5 h-5 text-[9.5px]' : 'w-4.5 h-4.5 text-[8.5px]'
            } rounded-full bg-gradient-to-tr ${avatarGradient} text-white font-bold flex items-center justify-center shrink-0 shadow-2xs`}
          >
            {(comment.mbrCommentsMbrName || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-semibold ${
                isRoot ? 'text-[11.5px] text-slate-900 dark:text-white' : 'text-[10.5px] text-slate-800 dark:text-slate-200'
              } truncate`}
            >
              {comment.mbrCommentsMbrName || 'Member'}
            </span>
            {parentComment && !isRoot && (
              <span className="text-[9.5px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                <CornerDownRight className="w-2 h-2 inline shrink-0" />
                <span>to</span>
                <span className="font-semibold">@{parentComment.mbrCommentsMbrName || 'Member'}</span>
              </span>
            )}
            <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
              <Clock className="w-2 h-2" />
              {formatTime(comment.mbrCommentsPostDt || comment.mbrCommentsCreatedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Edit, Delete, Reply */}
        <div className="flex items-center gap-0.5 shrink-0">
          {isAuthor && !isEditing && !showDeleteConfirm && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditContent(comment.mbrCommentsContent);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer px-1 py-0.2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit your comment"
              >
                <Pencil className="w-2 h-2" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer px-1 py-0.2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete your comment"
              >
                <Trash2 className="w-2 h-2" />
                <span>Delete</span>
              </button>
            </>
          )}

          {/* Delete Inline Confirmation */}
          {showDeleteConfirm && (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded px-1.5 py-0.2 text-[9.5px] animate-in fade-in duration-100">
              <span className="text-rose-700 dark:text-rose-300 font-medium">Delete?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 underline cursor-pointer px-0.5"
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer px-0.5"
              >
                No
              </button>
            </div>
          )}

          {/* Reply Action Button */}
          {!isEditing && (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer px-1.5 py-0.2 rounded hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
              title={`Reply to ${comment.mbrCommentsMbrName || 'this comment'}`}
            >
              <Reply className="w-2.5 h-2.5" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Comment Text Content or Inline Editor */}
      {isEditing ? (
        <div className={`space-y-1 ${isRoot ? 'pl-6.5' : 'pl-6'}`}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="w-full resize-none px-2 py-1 text-xs rounded-md border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
            autoFocus
          />
          <div className="flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-1.5 py-0.2 text-[10px] rounded font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editContent.trim() || isSaving}
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-0.5 px-2 py-0.2 text-[10px] rounded font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-2xs"
            >
              {isSaving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-xs text-slate-700 dark:text-slate-200 leading-snug whitespace-pre-line ${
            isRoot ? 'pl-6.5' : 'pl-6'
          }`}
        >
          {comment.mbrCommentsContent}
        </p>
      )}

      {/* Accordion Toggle for Top-Level Comment Replies */}
      {isRoot && children.length > 0 && (
        <div className="pl-6.5">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer py-0.2 px-1 -ml-1 rounded hover:bg-blue-50/70 dark:hover:bg-blue-950/40"
          >
            <ChevronDown
              className={`w-2.5 h-2.5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-blue-700 dark:text-blue-300' : ''
              }`}
            />
            <span>{isExpanded ? 'Hide replies' : `View ${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'}`}</span>
          </button>
        </div>
      )}

      {/* Nested Child Replies Indented Hierarchically */}
      {children.length > 0 && (!isRoot || isExpanded) && (
        <div
          className={`mt-1 pl-2 space-y-1 border-l-2 border-blue-200 dark:border-blue-900/60 ${
            isRoot ? 'ml-2' : 'ml-1.5'
          }`}
        >
          {children.map((childNode) => (
            <CommentThreadItem
              key={childNode.comment.mbrCommentsId}
              node={childNode}
              depth={depth + 1}
              onReply={onReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              formatTime={formatTime}
              commentMap={commentMap}
              activeReplyCommentId={activeReplyCommentId}
              loggedInMbrId={loggedInMbrId}
              loggedInMbrName={loggedInMbrName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StoryPageStoryPanel({
  storyId,
  storyTitle = 'Untitled Story',
  storyContent = '',
  storyTopic,
  publishedDate,
  authorName = 'Author',
  authorLocation,
  authorAvatarUrl,
  authorInitials = 'SB',
  connectionGrpName,
  onClickBack,
  onClickViewAuthorStorybook
}: StoryPageStoryPanelProps) {
  const topicKey = (storyTopic || '').toLowerCase();
  const badgeStyle = topicBadgeColors[topicKey] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700'
  };

  const displayTopic = formatTopicName(storyTopic);
  const formattedDate = formatDate(publishedDate);

  // Calculate approximate reading time
  const wordCount = (storyContent || '').trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Split into paragraphs for rich reading experience
  const paragraphs = (storyContent || '')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  // --- Reaction / Likes State ---
  const [likes, setLikes] = useState<MbrStoryLikes[]>([]);
  const [userReaction, setUserReaction] = useState<MbrStoryLikes | null>(null);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [hoveredReactionCd, setHoveredReactionCd] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Comments State & Dialog Box ---
  const [comments, setComments] = useState<MbrStoryComments[]>([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyToComment, setReplyToComment] = useState<MbrStoryComments | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const { mbrId: loggedInMbrId, mbrName: loggedInMbrName } = useMemo(() => getLoggedInMemberInfo(), []);

  // Fetch likes on mount
  useEffect(() => {
    let isCancelled = false;
    const loadLikes = async () => {
      if (!storyId || !UUID_REGEX.test(storyId)) {
        return;
      }
      try {
        const fetchedLikes = await taskApi.getMemberStoryLikes({ mbrStoryId: storyId });
        if (isCancelled) return;
        setLikes(fetchedLikes || []);
        const mine = (fetchedLikes || []).find((l) => l.mbrLikesMbrId === loggedInMbrId);
        setUserReaction(mine || null);
      } catch (err) {
        console.warn('Could not load likes for story:', storyId, err);
      }
    };
    loadLikes();
    return () => {
      isCancelled = true;
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [storyId, loggedInMbrId]);

  // Fetch comments on mount
  useEffect(() => {
    let isCancelled = false;
    const loadComments = async () => {
      if (!storyId || !UUID_REGEX.test(storyId)) return;
      try {
        const fetchedComments = await taskApi.getStoryComments({ mbrStoryId: storyId });
        if (!isCancelled) {
          setComments(fetchedComments || []);
        }
      } catch (err) {
        console.warn('Could not load comments for story:', storyId, err);
      }
    };
    loadComments();
    return () => {
      isCancelled = true;
    };
  }, [storyId]);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowReactionsPopup(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactionsPopup(false);
      setHoveredReactionCd(null);
    }, 300);
  };

  const handleSelectReaction = async (reactionCd: string) => {
    if (isLiking || !storyId) return;
    setIsLiking(true);
    setShowReactionsPopup(false);
    setHoveredReactionCd(null);

    const isDbReady = UUID_REGEX.test(storyId) && UUID_REGEX.test(loggedInMbrId);

    try {
      if (userReaction && userReaction.mbrStoryLikesCd === reactionCd) {
        // User clicked the same reaction -> Undo / Delete!
        const targetId = userReaction.mbrStoryLikesId;
        setUserReaction(null);
        setLikes((prev) => prev.filter((l) => l.mbrStoryLikesId !== targetId));

        if (isDbReady && UUID_REGEX.test(targetId)) {
          await taskApi.deleteMemberStoryLike(targetId);
        }
      } else if (userReaction) {
        // User clicked a different reaction -> Update!
        const targetId = userReaction.mbrStoryLikesId;
        const optimistic: MbrStoryLikes = {
          ...userReaction,
          mbrStoryLikesCd: reactionCd,
          mbrLikesMbrName: loggedInMbrName,
          mbrStoryLikesUpdatedAt: new Date().toISOString()
        };
        setUserReaction(optimistic);
        setLikes((prev) => prev.map((l) => (l.mbrStoryLikesId === targetId ? optimistic : l)));

        if (isDbReady && UUID_REGEX.test(targetId)) {
          const updated = await taskApi.updateMemberStoryLike(targetId, {
            mbrStoryLikesCd: reactionCd,
            mbrLikesMbrName: loggedInMbrName
          });
          setUserReaction(updated);
          setLikes((prev) => prev.map((l) => (l.mbrStoryLikesId === targetId ? updated : l)));
        }
      } else {
        // User clicked a new reaction -> Create!
        const optimisticId = `like-temp-${Date.now()}`;
        const optimistic: MbrStoryLikes = {
          mbrStoryLikesId: optimisticId,
          mbrStoryId: storyId,
          mbrStoryLikesCd: reactionCd,
          mbrLikesMbrId: loggedInMbrId,
          mbrLikesMbrName: loggedInMbrName,
          mbrStoryLikesCreatedAt: new Date().toISOString(),
          mbrStoryLikesUpdatedAt: new Date().toISOString()
        };
        setUserReaction(optimistic);
        setLikes((prev) => [optimistic, ...prev]);

        if (isDbReady) {
          const created = await taskApi.createMemberStoryLike({
            mbrStoryId: storyId,
            mbrStoryLikesCd: reactionCd,
            mbrLikesMbrId: loggedInMbrId,
            mbrLikesMbrName: loggedInMbrName,
          });
          setUserReaction(created);
          setLikes((prev) => prev.map((l) => (l.mbrStoryLikesId === optimisticId ? created : l)));
        }
      }
    } catch (err) {
      console.error('Error updating story like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleMainButtonClick = () => {
    if (userReaction) {
      handleSelectReaction(userReaction.mbrStoryLikesCd);
    } else {
      handleSelectReaction('Like');
    }
  };

  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentContent.trim() || isPostingComment || !storyId) return;

    const trimmed = newCommentContent.trim();
    setIsPostingComment(true);

    const isDbReady = UUID_REGEX.test(storyId);
    const optimisticId = `comm-temp-${Date.now()}`;
    const parentId = replyToComment ? replyToComment.mbrCommentsId : null;

    const optimistic: MbrStoryComments = {
      mbrCommentsId: optimisticId,
      mbrStoryId: storyId,
      mbrCommentsContent: trimmed,
      mbrCommentsParentId: parentId,
      mbrCommentsMbrId: loggedInMbrId,
      mbrCommentsMbrName: loggedInMbrName,
      mbrCommentsPostDt: new Date().toISOString(),
      mbrCommentsCreatedAt: new Date().toISOString(),
      mbrCommentsUpdatedAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, optimistic]);
    setNewCommentContent('');
    setReplyToComment(null);

    try {
      if (isDbReady) {
        const created = await taskApi.createStoryComment({
          mbrStoryId: storyId,
          mbrCommentsContent: trimmed,
          mbrCommentsParentId: parentId || undefined,
          mbrCommentsMbrId: loggedInMbrId || undefined,
          mbrCommentsMbrName: loggedInMbrName
        });
        setComments((prev) => prev.map((c) => (c.mbrCommentsId === optimisticId ? created : c)));
      }
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.mbrCommentsId === commentId
          ? { ...c, mbrCommentsContent: newContent, mbrCommentsUpdatedAt: new Date().toISOString() }
          : c
      )
    );
    if (storyId && UUID_REGEX.test(storyId) && UUID_REGEX.test(commentId)) {
      try {
        await taskApi.updateStoryComment(commentId, { mbrCommentsContent: newContent });
      } catch (err) {
        console.error('Failed to update comment in backend:', err);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const getDescendantIds = (targetId: string, list: MbrStoryComments[]): Set<string> => {
      const ids = new Set<string>([targetId]);
      let added = true;
      while (added) {
        added = false;
        for (const c of list) {
          if (c.mbrCommentsParentId && ids.has(c.mbrCommentsParentId) && !ids.has(c.mbrCommentsId)) {
            ids.add(c.mbrCommentsId);
            added = true;
          }
        }
      }
      return ids;
    };

    const toRemove = getDescendantIds(commentId, comments);
    setComments((prev) => prev.filter((c) => !toRemove.has(c.mbrCommentsId)));
    if (storyId && UUID_REGEX.test(storyId) && UUID_REGEX.test(commentId)) {
      try {
        await taskApi.deleteStoryComment(commentId);
      } catch (err) {
        console.error('Failed to delete comment in backend:', err);
      }
    }
  };

  const handleInitiateReply = (comment: MbrStoryComments) => {
    setReplyToComment(comment);
    commentInputRef.current?.focus();
  };

  const activeReactionConfig = userReaction?.mbrStoryLikesCd
    ? REACTION_CONFIGS[userReaction.mbrStoryLikesCd] || REACTION_CONFIGS.Like
    : null;

  // Distinct top emojis for summary
  const uniqueReactionEmojis = useMemo(() => {
    const emojis: string[] = [];
    for (const like of likes) {
      const emoji = REACTION_CONFIGS[like.mbrStoryLikesCd]?.emoji || '👍';
      if (!emojis.includes(emoji)) {
        emojis.push(emoji);
      }
      if (emojis.length >= 3) break;
    }
    return emojis;
  }, [likes]);

  // Organize comments into lookup map and tree
  const commentMap = useMemo(() => {
    const map = new Map<string, MbrStoryComments>();
    comments.forEach((c) => {
      map.set(c.mbrCommentsId, c);
    });
    return map;
  }, [comments]);

  const commentTree = useMemo<CommentTreeNode[]>(() => {
    const nodeMap = new Map<string, CommentTreeNode>();
    const roots: CommentTreeNode[] = [];

    comments.forEach((c) => {
      nodeMap.set(c.mbrCommentsId, { comment: c, children: [] });
    });

    comments.forEach((c) => {
      const node = nodeMap.get(c.mbrCommentsId)!;
      if (c.mbrCommentsParentId && nodeMap.has(c.mbrCommentsParentId)) {
        nodeMap.get(c.mbrCommentsParentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-90" />

      {/* Header Metadata */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          {displayTopic}
        </span>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {readTimeMinutes} min read ({wordCount} words)
          </span>
        </div>
      </div>

      {/* Story Headline Title */}
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-snug mb-6">
        {storyTitle}
      </h1>

      {/* Author Byline Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center shrink-0">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={authorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-serif font-bold text-xs text-slate-700 dark:text-slate-200">
                {authorInitials}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                {authorName}
              </span>
              {connectionGrpName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40">
                  <Users className="w-2.5 h-2.5" />
                  {connectionGrpName}
                </span>
              )}
            </div>
            {authorLocation && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {authorLocation}
              </span>
            )}
          </div>
        </div>

        {onClickViewAuthorStorybook && (
          <button
            type="button"
            onClick={onClickViewAuthorStorybook}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Author's Storybook</span>
          </button>
        )}
      </div>

      {/* Audiobook Narration Player */}
      {storyContent && (
        <div className="mb-8">
          <StoryAudioPlayer
            text={`${storyTitle}. ${storyContent}`}
            storyId={storyTitle}
            title={storyTitle}
            variant="full"
          />
        </div>
      )}

      {/* Story Body Text / Full Narrative */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p
              key={index}
              className="font-serif text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed mb-6 font-normal"
            >
              {para}
            </p>
          ))
        ) : (
          <p className="font-serif text-base text-slate-500 italic">
            No narrative content published for this chapter.
          </p>
        )}
      </div>

      {/* Reaction & Comments Action Bar */}
      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 relative flex-wrap">
          {/* Reaction Trigger Button Container */}
          <div
            className="relative inline-flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Animated Pop-up Reactions Row */}
            <AnimatePresence>
              {showReactionsPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.88 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute bottom-full left-0 mb-2.5 z-40 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-2xl rounded-full px-2 py-1.5 flex items-center gap-1 sm:gap-1.5"
                >
                  {ORDERED_REACTIONS.map((cd) => {
                    const config = REACTION_CONFIGS[cd];
                    const isSelected = userReaction?.mbrStoryLikesCd === cd;

                    return (
                      <motion.button
                        key={cd}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectReaction(cd);
                        }}
                        onMouseEnter={() => setHoveredReactionCd(cd)}
                        onMouseLeave={() => setHoveredReactionCd(null)}
                        whileHover={{ scale: 1.35, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                        className={`relative p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/60 ring-2 ring-blue-500'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={config.label}
                      >
                        <span className="text-xl leading-none select-none filter drop-shadow-xs">
                          {config.emoji}
                        </span>

                        {/* Animated Tooltip Label on Hover */}
                        <AnimatePresence>
                          {hoveredReactionCd === cd && (
                            <motion.span
                              initial={{ opacity: 0, y: 4, scale: 0.8 }}
                              animate={{ opacity: 1, y: -24, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.8 }}
                              transition={{ duration: 0.12 }}
                              className="absolute pointer-events-none px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md whitespace-nowrap z-50"
                            >
                              {config.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Reaction Button */}
            <button
              type="button"
              onClick={handleMainButtonClick}
              disabled={isLiking}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeReactionConfig
                  ? `${activeReactionConfig.bgColor} ${activeReactionConfig.color} border-slate-200 dark:border-slate-700 shadow-xs font-bold`
                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
              }`}
              title={activeReactionConfig ? `Reacted with ${activeReactionConfig.label} (Click to undo)` : 'Like this story (Hover for more reactions)'}
            >
              {activeReactionConfig ? (
                <span className="text-base leading-none">{activeReactionConfig.emoji}</span>
              ) : (
                <ThumbsUp className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
              )}
              <span>{activeReactionConfig ? activeReactionConfig.label : 'Like'}</span>
            </button>
          </div>

          {/* Reactions Count & Summary Icons */}
          {likes.length > 0 && (
            <div 
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
              title={`Liked by: ${likes.map(l => l.mbrLikesMbrName || 'Member').join(', ')}`}
            >
              <div className="flex -space-x-1 items-center">
                {uniqueReactionEmojis.map((emoji, idx) => (
                  <span 
                    key={idx} 
                    className="w-4 h-4 text-xs flex items-center justify-center rounded-full bg-white dark:bg-slate-850 shadow-2xs border border-white dark:border-slate-800"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {likes.length}
              </span>
            </div>
          )}

          {/* Comment Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCommentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs"
            title="Read comments and join the conversation"
          >
            <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span>Comment</span>
            {comments.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                {comments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Story Footer Navigation */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Preserved with StoryBook</span>
        </div>

        <div className="flex items-center gap-3">
          {onClickBack && (
            <button
              type="button"
              onClick={onClickBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Stories</span>
            </button>
          )}
        </div>
      </div>

      {/* --- STORY COMMENTS & CONVERSATION DIALOG MODAL --- */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommentModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Dialog Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg sm:max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                    {authorAvatarUrl ? (
                      <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                        {authorInitials || authorName.charAt(0) || 'M'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {authorName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{displayTopic}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsCommentModalOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Body: Full Story View + Scrollable Comments Window */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-2 custom-scrollbar">
                {/* 1. Story View Summary Card */}
                <div className="bg-slate-50/70 dark:bg-slate-850/60 rounded-lg p-2 sm:p-2.5 border border-slate-200/70 dark:border-slate-800/80 space-y-1 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-serif text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {storyTitle}
                    </h2>
                    {storyContent && (
                      <StoryAudioPlayer
                        text={`${storyTitle}. ${storyContent}`}
                        storyId={storyId || storyTitle}
                        title={storyTitle}
                        variant="inline-button"
                      />
                    )}
                  </div>

                  {storyContent ? (
                    <div className="font-sans text-[11.5px] text-slate-700 dark:text-slate-200 leading-snug whitespace-pre-line line-clamp-3">
                      {storyContent}
                    </div>
                  ) : (
                    <p className="text-[10.5px] italic text-slate-400 dark:text-slate-500">
                      (No content text provided for this story chapter)
                    </p>
                  )}
                </div>

                {/* 2. Comments Header & Count */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between pb-0.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Comments & Replies
                      </h4>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {comments.length}
                      </span>
                    </div>
                  </div>

                  {/* 3. Existing Story Comments List (Scrollable Area) */}
                  {comments.length === 0 ? (
                    <div className="py-4 text-center bg-slate-50/50 dark:bg-slate-850/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      <MessageSquare className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600 mb-0.5" />
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        No comments on this story yet.
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Share your thoughts or memories below!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {commentTree.map((rootNode) => (
                        <CommentThreadItem
                          key={rootNode.comment.mbrCommentsId}
                          node={rootNode}
                          depth={0}
                          onReply={handleInitiateReply}
                          onUpdateComment={handleUpdateComment}
                          onDeleteComment={handleDeleteComment}
                          formatTime={formatCommentTime}
                          commentMap={commentMap}
                          activeReplyCommentId={replyToComment?.mbrCommentsId}
                          loggedInMbrId={loggedInMbrId}
                          loggedInMbrName={loggedInMbrName}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>

              {/* 4. Locked / Sticky Bottom Comment Composer Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 p-1.5 sm:p-2 bg-white dark:bg-slate-900 shrink-0 space-y-1 shadow-lg">
                {/* Active Reply Banner */}
                {replyToComment && (
                  <div className="flex items-center justify-between px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-md text-[11px] text-blue-700 dark:text-blue-300 animate-in fade-in duration-150">
                    <span className="truncate flex items-center gap-1 min-w-0">
                      <CornerDownRight className="w-2.5 h-2.5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="truncate">
                        Replying to <span className="font-semibold">@{replyToComment.mbrCommentsMbrName || 'Member'}</span>: <span className="font-medium italic">"{replyToComment.mbrCommentsContent.slice(0, 32)}{replyToComment.mbrCommentsContent.length > 32 ? '...' : ''}"</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyToComment(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1.5 shrink-0 p-0.5 cursor-pointer rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Cancel reply"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Comment Form */}
                <form onSubmit={handlePostComment} className="flex gap-1.5 items-center">
                  <textarea
                    ref={commentInputRef}
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder={replyToComment ? 'Write a friendly reply...' : 'Post a thoughtful comment...'}
                    rows={1}
                    className="flex-1 resize-none px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newCommentContent.trim() || isPostingComment}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer h-8"
                  >
                    {isPostingComment ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>{replyToComment ? 'Reply' : 'Post'}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminComponentTag name="storyPageStoryPanel" />
    </motion.article>
  );
}

export { StoryPageStoryPanel as storyPageStoryPanel };
