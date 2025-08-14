import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import api, { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { getSocket } from '../services/socketService';
import { PaperAirplaneIcon, PlusIcon, TrashIcon, UsersIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { resetUnreadMessages } from '../redux/slices/uiSlice';
import { MessageList } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import styled, { createGlobalStyle } from 'styled-components';
import './chat-wa.css';

const resolveAvatar = (url, fallbackName) => {
  if (url) {
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace(/\/api$/, '');
    return `${base}${url}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'U')}`;
};

// // WhatsApp-inspired dark theme styling
// const ChatWhatsAppTheme = createGlobalStyle`
//   /* Moved most CSS to chat-wa.css to keep this file small. Keeping only critical color overrides that need JS scoping if required. */
//   /* WhatsApp-like chat container styling */
//   .chat-wa {
//     background: #efeae2 !important; /* Light mode: WhatsApp-like paper */
//     position: relative;
//   }

//   /* Dark mode background */
//   .dark .chat-wa {
//     background: linear-gradient(135deg, #0c1317 0%, #202c33 100%) !important;
//   }

//   /* WhatsApp background pattern overlay - Light */
//   .chat-wa::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background-image: 
//       radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
//       radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.02) 0%, transparent 50%),
//       radial-gradient(circle at 40% 40%, rgba(0, 0, 0, 0.02) 0%, transparent 50%);
//     pointer-events: none;
//   }

//   /* WhatsApp background pattern overlay - Dark */
//   .dark .chat-wa::before {
//     background-image: 
//       radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
//       radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
//       radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.02) 0%, transparent 50%);
//   }

//   /* Message bubble styling - Light mode */
//   .rce-message .rce-mbox,
//   .rce-message .rce-mbox > .rce-mbox-body {
//     border-radius: 18px !important;
//     box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
//     border: none !important;
//   }

//   .rce-mbox .rce-mbox-title {
//     font-weight: 600;
//     margin-bottom: 2px;
//     font-size: 14px;
//   }

//   .rce-mbox-text {
//     line-height: 1.4;
//     font-size: 14px;
//   }

//   .rce-mbox-time {
//     opacity: 0.7;
//     font-size: 11px;
//     margin-top: 2px;
//   }

//   /* Light mode - Left (received) - Soft gray */
//   .chat-wa .rce-message.rce-message--left .rce-mbox,
//   .chat-wa .rce-message.rce-message--left .rce-mbox > .rce-mbox-body,
//   .chat-wa .rce-mbox.rce-mbox-left,
//   .chat-wa .rce-mbox.rce-mbox-left > .rce-mbox-body,
//   .rce-message.rce-message--left .rce-mbox,
//   .rce-message.rce-message--left .rce-mbox > .rce-mbox-body {
//     background: #f3f4f6 !important; /* slate-100 */
//     background-color: #f3f4f6 !important;
//     color: #111b21 !important;
//   }

//   .chat-wa .rce-message.rce-message--left .rce-mbox:before,
//   .chat-wa .rce-message.rce-message--left .rce-mbox:after,
//   .chat-wa .rce-message.rce-message--left .rce-mbox-body:before,
//   .chat-wa .rce-message.rce-message--left .rce-mbox-body:after,
//   .chat-wa .rce-mbox.rce-mbox-left:before,
//   .chat-wa .rce-mbox.rce-mbox-left:after,
//   .chat-wa .rce-mbox-left:before,
//   .chat-wa .rce-mbox-left:after,
//   .rce-message.rce-message--left .rce-mbox:before,
//   .rce-message.rce-message--left .rce-mbox:after,
//   .rce-message.rce-message--left .rce-mbox-body:before,
//   .rce-message.rce-message--left .rce-mbox-body:after {
//     border-right-color: #f3f4f6 !important;
//     border-left-color: transparent !important;
//     border-top-color: transparent !important;
//     border-bottom-color: transparent !important;
//   }

//   /* Light mode - Right (sent) - Soft green */
//   .chat-wa .rce-message.rce-message--right .rce-mbox,
//   .chat-wa .rce-message.rce-message--right .rce-mbox > .rce-mbox-body,
//   .chat-wa .rce-mbox.rce-mbox-right,
//   .chat-wa .rce-mbox.rce-mbox-right > .rce-mbox-body,
//   .rce-message.rce-message--right .rce-mbox,
//   .rce-message.rce-message--right .rce-mbox > .rce-mbox-body {
//     background: #d9fdd3 !important;
//     background-color: #d9fdd3 !important;
//     color: #111b21 !important;
//   }

//   .chat-wa .rce-message.rce-message--right .rce-mbox:before,
//   .chat-wa .rce-message.rce-message--right .rce-mbox:after,
//   .chat-wa .rce-message.rce-message--right .rce-mbox-body:before,
//   .chat-wa .rce-message.rce-message--right .rce-mbox-body:after,
//   .chat-wa .rce-mbox.rce-mbox-right:before,
//   .chat-wa .rce-mbox.rce-mbox-right:after,
//   .chat-wa .rce-mbox-right:before,
//   .chat-wa .rce-mbox-right:after,
//   .rce-message.rce-message--right .rce-mbox:before,
//   .rce-message.rce-message--right .rce-mbox:after,
//   .rce-message.rce-message--right .rce-mbox-body:before,
//   .rce-message.rce-message--right .rce-mbox-body:after {
//     border-left-color: #d9fdd3 !important;
//     border-right-color: transparent !important;
//     border-top-color: transparent !important;
//     border-bottom-color: transparent !important;
//   }

//   /* Dark mode - Left (received) - White */
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox > .rce-mbox-body,
//   .dark .chat-wa .rce-mbox.rce-mbox-left,
//   .dark .chat-wa .rce-mbox.rce-mbox-left > .rce-mbox-body,
//   .dark .rce-message.rce-message--left .rce-mbox,
//   .dark .rce-message.rce-message--left .rce-mbox > .rce-mbox-body {
//     background: #ffffff !important;
//     color: #111827 !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox:before,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox:after,
//    .dark .chat-wa .rce-message.rce-message--left .rce-mbox-body:before,
//    .dark .chat-wa .rce-message.rce-message--left .rce-mbox-body:after,
//   .dark .chat-wa .rce-mbox.rce-mbox-left:before,
//   .dark .chat-wa .rce-mbox.rce-mbox-left:after,
//   .dark .chat-wa .rce-mbox-left:before,
//   .dark .chat-wa .rce-mbox-left:after,
//   .dark .rce-message.rce-message--left .rce-mbox:before,
//   .dark .rce-message.rce-message--left .rce-mbox:after,
//   .dark .rce-message.rce-message--left .rce-mbox-body:before,
//   .dark .rce-message.rce-message--left .rce-mbox-body:after {
//     border-right-color: #ffffff !important;
//     border-left-color: transparent !important;
//     border-top-color: transparent !important;
//     border-bottom-color: transparent !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-text,
//   .dark .rce-message.rce-message--left .rce-mbox .rce-mbox-text {
//     color: #111827 !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-time,
//   .dark .rce-message.rce-message--left .rce-mbox .rce-mbox-time {
//     color: #6b7280 !important; /* gray-500 */
//   }

//   /* Dark mode - Right (sent) - Soft mint */
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox > .rce-mbox-body,
//   .dark .chat-wa .rce-mbox.rce-mbox-right,
//   .dark .chat-wa .rce-mbox.rce-mbox-right > .rce-mbox-body,
//   .dark .rce-message.rce-message--right .rce-mbox,
//   .dark .rce-message.rce-message--right .rce-mbox > .rce-mbox-body {
//     background: #c1f7d0 !important; /* mint */
//     color: #111827 !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox:before,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox:after,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox-body:before,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox-body:after,
//   .dark .chat-wa .rce-mbox.rce-mbox-right:before,
//   .dark .chat-wa .rce-mbox.rce-mbox-right:after,
//   .dark .chat-wa .rce-mbox-right:before,
//   .dark .chat-wa .rce-mbox-right:after,
//   .dark .rce-message.rce-message--right .rce-mbox:before,
//   .dark .rce-message.rce-message--right .rce-mbox:after,
//   .dark .rce-message.rce-message--right .rce-mbox-body:before,
//   .dark .rce-message.rce-message--right .rce-mbox-body:after {
//     border-left-color: #c1f7d0 !important;
//     border-right-color: transparent !important;
//     border-top-color: transparent !important;
//     border-bottom-color: transparent !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-text,
//   .dark .rce-message.rce-message--right .rce-mbox .rce-mbox-text {
//     color: #111827 !important;
//   }

//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-time,
//   .dark .rce-message.rce-message--right .rce-mbox .rce-mbox-time {
//     color: #6b7280 !important;
//   }

//   /* Remove bubble tails (both sides) */
//   // .chat-wa .rce-mbox:before,
//   // .chat-wa .rce-mbox:after,
//   // .chat-wa .rce-mbox-body:before,
//   // .chat-wa .rce-mbox-body:after,
//   // .chat-wa .rce-message .rce-mbox:before,
//   // .chat-wa .rce-message .rce-mbox:after,
//   // .chat-wa .rce-message .rce-mbox-body:before,
//   // .chat-wa .rce-message .rce-mbox-body:after {
//   //   display: none !important;
//   //   border: 0 !important;
//   // }

//   /* Force dark text in dark mode when bubbles are light */
//   .dark .chat-wa .rce-mbox .rce-mbox-text,
//   .dark .chat-wa .rce-mbox .rce-mbox-title {
//     color: #111827 !important; /* slate-900 */
//   }
//   .dark .chat-wa .rce-mbox .rce-mbox-text *,
//   .dark .chat-wa .rce-mbox .rce-mbox-title * {
//     color: #111827 !important;
//   }
//   .dark .chat-wa .rce-mbox .rce-mbox-text a,
//   .dark .chat-wa .rce-mbox .rce-mbox-title a {
//     color: #111827 !important;
//   }

//   /* Ensure override wins over side-specific rules */
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-text,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-text,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-title,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-title,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-text *,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-text *,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-title *,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-title * {
//     color: #111827 !important;
//   }
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-text a,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-text a,
//   .dark .chat-wa .rce-message.rce-message--left .rce-mbox .rce-mbox-title a,
//   .dark .chat-wa .rce-message.rce-message--right .rce-mbox .rce-mbox-title a {
//     color: #111827 !important;
//   }

//   /* WhatsApp-like scrollbar */
//   .chat-wa::-webkit-scrollbar {
//     width: 6px;
//   }

//   .chat-wa::-webkit-scrollbar-track {
//     background: transparent;
//   }

//   .chat-wa::-webkit-scrollbar-thumb {
//     background: #8696a0;
//     border-radius: 3px;
//   }

//   .chat-wa::-webkit-scrollbar-thumb:hover {
//     background: #667781;
//   }

//   /* Message list container */
//   .message-list {
//     padding: 16px !important;
//   }

//   /* Avatar styling */
//   .rce-avatar {
//     border: 2px solid #00a884 !important;
//   }

//   .dark .rce-avatar {
//     border: 2px solid #00a884 !important;
//   }

//   /* Always show avatar for right-side (self) messages as well */
//   .chat-wa .rce-message.rce-message--right .rce-avatar,
//   .chat-wa .rce-message.rce-message--right .rce-avatar-container {
//     display: inline-flex !important;
//   }

//   /* WhatsApp-like message status indicators */
//   .rce-mbox-status {
//     margin-top: 2px !important;
//   }

//   .rce-mbox-status svg {
//     width: 16px !important;
//     height: 16px !important;
//   }

//   /* Status colors for dark mode */
//   .dark .rce-mbox-status svg[data-status="sent"] {
//     color: #8696a0 !important; /* grey single check */
//   }
//   .dark .rce-mbox-status svg[data-status="waiting"] {
//     color: #8696a0 !important;
//   }

//   .dark .rce-mbox-status svg[data-status="received"] {
//     color: #53bdeb !important;
//   }

//   .dark .rce-mbox-status svg[data-status="read"] {
//     color: #53bdeb !important;
//   }

//   /* Light mode status colors */
//   .rce-mbox-status svg[data-status="sent"] {
//     color: #8696a0 !important;
//   }
//   .rce-mbox-status svg[data-status="waiting"] {
//     color: #8696a0 !important;
//   }

//   .rce-mbox-status svg[data-status="received"] {
//     color: #53bdeb !important;
//   }

//   .rce-mbox-status svg[data-status="read"] {
//     color: #53bdeb !important;
//   }

//   /* Message spacing and layout improvements */
//   .rce-message {
//     margin-bottom: 8px !important;
//   }

//   .rce-message:last-child {
//     margin-bottom: 0 !important;
//   }

//   /* Typing indicator styling */
//   .rce-message.rce-message--left .rce-mbox {
//     max-width: 70% !important;
//   }

//   .rce-message.rce-message--right .rce-mbox {
//     max-width: 70% !important;
//   }
// `;

dayjs.extend(relativeTime);

const Chat = () => {
  const { t, i18n } = useTranslation();
  const authUser = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [conversations, setConversations] = useState([]);
  // groups removed
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [active, setActive] = useState({ type: 'global', id: 'global', title: 'Global Chat' });
  const [messages, setMessages] = useState([]);
  const [dmUnreadMap, setDmUnreadMap] = useState(() => {
    try {
      const raw = localStorage.getItem('chatUnreadByUser');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [userMap, setUserMap] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const StyledMessageContainer = styled.div``;
  const [selfAvatarUrl, setSelfAvatarUrl] = useState('');

  useEffect(() => {
    if (!authUser) return;
    const socket = getSocket();
    const identify = () => socket?.emit('identify', authUser._id);
    if (socket?.connected) identify();
    socket?.on?.('connect', identify);
    const chatMessageHandler = async ({ message }) => {
      // If message belongs to current active thread, append; else could show badge (out of scope)
      if (
        (active.type === 'dm' && message.senderId === active.id) ||
        (active.type === 'dm' && message.receiverId === active.id && message.senderId === authUser._id) ||
         // group removed
        (active.type === 'global' && message.isGlobal)
      ) {
        setMessages((prev) => {
          if (!message?._id) return [...prev, message];
          return prev.some((m) => m._id === message._id) ? prev : [...prev, message];
        });
        // Mark as delivered if current user is receiver
        if (message.receiverId === authUser._id) {
          try { await api.post(API_ENDPOINTS.MESSAGE_DELIVERED(message._id)); } catch {}
        }
        scrollToBottom();
      } else {
        // If DM from another user and no conversation selected, append preview to conversations list
        if (!message.groupId && message.senderId !== authUser._id) {
          setConversations((prev) => {
            const exists = prev.find((c) => c.userId === message.senderId);
            if (exists) return [{ userId: message.senderId, lastMessage: message }, ...prev.filter((c) => c.userId !== message.senderId)];
            return [{ userId: message.senderId, lastMessage: message }, ...prev];
          });
          try {
            if (!(active.type === 'dm' && active.id === message.senderId)) {
              const raw = localStorage.getItem('chatUnreadByUser');
              const map = raw ? JSON.parse(raw) : {};
              map[message.senderId] = (map[message.senderId] || 0) + 1;
              localStorage.setItem('chatUnreadByUser', JSON.stringify(map));
              setDmUnreadMap(map);
            }
          } catch {}
          // ensure sender exists in userMap (fetch if missing)
          try {
            if (!userMap[message.senderId]) {
              const ur = await api.get(API_ENDPOINTS.CHAT_USERS_BASIC(String(message.senderId)));
              const arr = ur.data?.data || [];
              if (arr.length) {
                const u = arr[0];
                setUserMap((prev) => ({ ...prev, [u._id]: u }));
              }
            }
          } catch {}
        }
      }
    };
    socket?.on?.('message:new', chatMessageHandler);
    // Presence listeners
    const presenceOnline = ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(String(userId)));
    };
    const presenceOffline = ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    };
    const presenceList = ({ userIds }) => {
      setOnlineUserIds(new Set((userIds || []).map(String)));
    };
    socket?.on?.('presence:online', presenceOnline);
    socket?.on?.('presence:offline', presenceOffline);
    socket?.on?.('presence:list', presenceList);
    const statusHandler = ({ id, deliveredAt, readAt }) => {
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, deliveredAt: deliveredAt || m.deliveredAt, readAt: readAt || m.readAt } : m));
    };
    socket?.on?.('message:status', statusHandler);
    return () => {
      socket?.off?.('message:new', chatMessageHandler);
      socket?.off?.('presence:online', presenceOnline);
      socket?.off?.('presence:offline', presenceOffline);
      socket?.off?.('presence:list', presenceList);
      socket?.off?.('message:status', statusHandler);
      socket?.off?.('connect', identify);
    };
  }, [authUser, active]);

  useEffect(() => {
    const load = async () => {
      const convRes = await api.get(API_ENDPOINTS.CONVERSATIONS);
      setConversations(convRes.data?.data || []);
      // groups removed
      // Auto open first conversation/group if none selected
      if (!active.id || active.type === 'global') {
        const res = await api.get(API_ENDPOINTS.MESSAGES_GLOBAL);
        setMessages(res.data?.data || []);
      }
      // Preload basic user info for conversations
      try {
        const allUsersRes = await api.get(API_ENDPOINTS.CHAT_USERS_ALL);
        const map = {};
        (allUsersRes.data?.data || []).forEach((u) => { map[u._id] = u; });
        setUserMap(map);
      } catch {}
    };
    load();
    // Mark chat open and reset unread on entering chat
    try { localStorage.setItem('isChatOpen', 'true'); } catch {}
    dispatch(resetUnreadMessages());
    // On unmount, mark chat closed so future messages increment badge
    return () => { try { localStorage.setItem('isChatOpen', 'false'); } catch {} };
  }, []);

  // Load latest profile avatar for self
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PROFILE);
        if (data?.avatarUrl) setSelfAvatarUrl(data.avatarUrl);
      } catch {}
    };
    loadProfile();
  }, []);

  // Request presence list on mount/when socket connected
  useEffect(() => {
    const socket = getSocket();
    try { socket?.emit?.('presence:list:request'); } catch {}
  }, []);

  const openDM = async (userId, title = '') => {
    setActive({ type: 'dm', id: userId, title });
    const res = await api.get(API_ENDPOINTS.MESSAGES_WITH(userId));
    const msgs = res.data?.data || [];
    setMessages(msgs);
    // Mark all received messages as delivered + read (best-effort)
    try {
      await Promise.all(
        msgs
          .filter(m => m.receiverId === authUser?._id)
          .map(async (m) => {
            if (!m.deliveredAt) {
              try { await api.post(API_ENDPOINTS.MESSAGE_DELIVERED(m._id)); } catch {}
            }
            if (!m.readAt) {
              try { await api.post(API_ENDPOINTS.MESSAGE_READ(m._id)); } catch {}
            }
          })
      );
    } catch {}
    // reset unread counter for this user
    try {
      const raw = localStorage.getItem('chatUnreadByUser');
      const map = raw ? JSON.parse(raw) : {};
      if (map[userId]) {
        delete map[userId];
        localStorage.setItem('chatUnreadByUser', JSON.stringify(map));
        setDmUnreadMap(map);
      }
    } catch {}
    scrollToBottom();
  };

  const openGlobal = async () => {
    setActive({ type: 'global', id: 'global', title: 'Global Chat' });
    const res = await api.get(API_ENDPOINTS.MESSAGES_GLOBAL);
    const msgs = res.data?.data || [];
    setMessages(msgs);
    // Mark global messages as read for current user (so sender sees blue ticks)
    try {
      await Promise.all(
        msgs.filter(m => m.isGlobal && m.senderId !== authUser?._id && !m.readAt).map(m => api.post(API_ENDPOINTS.MESSAGE_READ(m._id)))
      );
    } catch {}
    scrollToBottom();
  };

  const doLookup = async () => {
    setError('');
    setLookupResult(null);
    if (!lookupQuery.trim()) return;
    try {
      const res = await api.get(API_ENDPOINTS.USER_LOOKUP(lookupQuery.trim()));
      setLookupResult(res.data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'User not found');
    }
  };

  const sendMessage = async () => {
    setError('');
    if (!text.trim()) return;
    if (!active.id) { setError(t('chat.selectFirst', 'Select a conversation or group first')); return; }
    try {
      let payload = { text };
      if (active.type === 'dm') payload = { receiverId: active.id, text };
      else if (active.type === 'global') payload = { isGlobal: true, text };
      const { data } = await api.post(API_ENDPOINTS.MESSAGES, payload);
      // Optimistic append with de-dup by _id to prevent double when socket echoes
      setMessages((prev) => {
        const newMsg = data?.data;
        if (!newMsg?._id) return [...prev, newMsg];
        return prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg];
      });
      setText('');
      scrollToBottom();
    } catch (e) {
      setError(e?.response?.data?.message || t('chat.failedToSend', 'Failed to send message'));
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-6">
        
        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium"><UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-500"/> Global</div>
            <button onClick={openGlobal} className={`w-full text-left p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${active.type==='global' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Global Chat</button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium"><ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-500"/> {t('chat.directMessages', 'Direct Messages')}</div>
            <div className="flex flex-col xs:flex-row gap-2 mb-2 sm:mb-3">
              <input 
                value={lookupQuery} 
                onChange={(e)=>setLookupQuery(e.target.value)} 
                onKeyDown={(e)=>{ if(e.key==='Enter'){doLookup()} }} 
                placeholder={t('chat.findUserPlaceholder', 'Find by username/email')} 
                className="w-full xs:w-2/3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
              />
              <button 
                onClick={doLookup} 
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md sm:rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-sm hover:shadow-md"
              >
                {t('chat.go', 'Go')}
              </button>
            </div>
            {lookupResult && (
              <button onClick={()=>openDM(lookupResult._id, lookupResult.username || lookupResult.email)} className="w-full text-left p-2 sm:p-3 mb-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors border border-primary-200 dark:border-primary-700 text-xs sm:text-sm">
                {t('chat.startChatWith', 'Start chat with')} {lookupResult.username || lookupResult.email}
              </button>
            )}
            <div className="space-y-1.5 sm:space-y-2 max-h-72 sm:max-h-80 overflow-y-auto">
              {Object.values(userMap)
                .sort((a, b) => {
                  const aOnline = onlineUserIds.has(String(a._id));
                  const bOnline = onlineUserIds.has(String(b._id));
                  if (aOnline !== bOnline) return aOnline ? -1 : 1; // online first
                  const an = (a?.name || a?.username || '').toLowerCase();
                  const bn = (b?.name || b?.username || '').toLowerCase();
                  return an.localeCompare(bn, 'id');
                })
                .map((u) => {
                const displayName = u?.name || u?.username;
                return (
                  <button key={u._id} onClick={() => openDM(u._id, displayName)} className={`w-full text-left p-2 sm:p-3 rounded-md sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${active.type==='dm' && active.id===u._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <img src={resolveAvatar(u?.avatarUrl, displayName)} alt="" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm" />
                        <span
                          className={`absolute -bottom-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${onlineUserIds.has(String(u._id)) ? 'bg-emerald-500' : 'bg-gray-400'}`}
                          title={onlineUserIds.has(String(u._id)) ? (i18n?.language?.startsWith('id') ? 'Online' : 'Online') : (i18n?.language?.startsWith('id') ? 'Offline' : 'Offline')}
                        ></span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 flex-1 flex items-center justify-between">
                        <span className="font-medium truncate">{displayName}</span>
                        {(() => { const n = dmUnreadMap[u._id] || 0; return n>0 ? <span className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 font-semibold">{n}</span> : null; })()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[60vh] sm:h-[70vh] shadow-sm">
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm sm:text-base font-medium bg-gray-50 dark:bg-gray-700/50">{active.type==='global' ? t('chat.global', 'Global Chat') : (active.title || (active.type==='dm' ? t('chat.directMessage', 'Direct Message') : t('chat.group', 'Group')))}</div>
            <div ref={listRef} className="flex-1 overflow-y-auto p-0 chat-wa">
              <StyledMessageContainer>
              <MessageList
                className="message-list py-2 px-1.5 sm:py-3 sm:px-3 md:py-4 md:px-4"
                dataSource={(messages || []).map((m) => {
                  const isSelf = m.senderId === authUser?._id;
                  const sender = isSelf
                    ? { name: authUser?.name, username: authUser?.username, avatarUrl: selfAvatarUrl || authUser?.avatarUrl }
                    : userMap[m.senderId];
                  const displayName = sender?.name || sender?.username;
                  const isGlobal = m.isGlobal;
                  let relative = dayjs(m.createdAt ? m.createdAt : new Date())
                    .locale(i18n.language || 'en')
                    .fromNow();
                  if ((i18n.language || 'en').startsWith('id') && /detik/.test(relative)) {
                    relative = 'Baru saja';
                  }
                  return {
                    id: m._id,
                    position: isSelf ? 'right' : 'left',
                    type: 'text',
                    text: m.text,
                    date: m.createdAt ? new Date(m.createdAt) : new Date(),
                    dateString: relative,
                    title: displayName,
                    avatar: resolveAvatar(sender?.avatarUrl, displayName || (isSelf ? authUser?.username : '')),
                    status: isSelf
                      ? (
                          m.readAt
                            ? 'read'
                            : (
                                isGlobal
                                  ? 'received'
                                  : (m.deliveredAt ? 'received' : 'sent')
                              )
                        )
                      : undefined,
                  };
                })}
              />
              </StyledMessageContainer>
            </div>
            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1 sm:gap-2 bg-gray-50 dark:bg-gray-700/50">
              <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title={t('chat.attach', 'Attach')}>
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300"/>
              </button>
              <button
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={()=> setIsClearOpen(true)}
                title={t('chat.clear', 'Clear chat')}
              >
                <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300"/>
              </button>
              <div className="flex-1 flex items-center gap-1 sm:gap-2">
                <input 
                  value={text} 
                  onChange={(e)=>setText(e.target.value)} 
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } }} 
                  placeholder={t('chat.typeMessage', 'Type a message')} 
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!text.trim() || !active.id} 
                  className={`p-2 sm:p-3 rounded-full flex items-center justify-center transition-all duration-200 ${(!text.trim() || !active.id) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md sm:shadow-lg hover:shadow-xl transform hover:scale-105'}`}
                >
                  <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5"/>
                </button>
              </div>
            </div>
            {/* Confirm Clear Modal */}
            {isClearOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50" onClick={()=>!isClearing && setIsClearOpen(false)} />
                <div className="relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm mx-2 sm:mx-4 p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">{t('chat.clearTitle', 'Clear chat?')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{t('chat.clearDesc', 'This will remove the conversation from your view. Others will still see their copy.')}</p>
                  <div className="flex justify-end gap-2 sm:gap-3">
                    <button disabled={isClearing} onClick={()=> setIsClearOpen(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 transition-colors">
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      disabled={isClearing}
                      onClick={async ()=>{
                        setIsClearing(true);
                        try {
                          if (active.type === 'dm') {
                            await api.post(API_ENDPOINTS.MESSAGES_CLEAR, { withUserId: active.id });
                          } else if (active.type === 'global') {
                            await api.post(API_ENDPOINTS.MESSAGES_CLEAR, { isGlobal: true });
                          }
                          setMessages([]);
                          setIsClearOpen(false);
                        } catch {}
                        setIsClearing(false);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm disabled:opacity-60 transition-colors"
                    >
                      {isClearing ? t('common.loading', 'Loading...') : t('chat.clear', 'Clear chat')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && <div className="px-3 sm:px-4 pb-2 sm:pb-3 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg py-1.5 sm:py-2">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;


