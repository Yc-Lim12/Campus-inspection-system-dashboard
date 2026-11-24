const KEY = 'ci-assistant-history';

export const emptyAssistantHistory = { activeId: null, conversations: [] };

export function cancelAssistantCommands(messages) {
  return messages.map(message => message.command && !message.result ? { ...message, result: 'cancel' } : message);
}

export function readAssistantHistory(role) {
  if (!role) return emptyAssistantHistory;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    if (saved?.role === role && Array.isArray(saved.history?.conversations)) {
      const conversations = saved.history.conversations.map(chat => ({ ...chat, messages: cancelAssistantCommands(chat.messages) }));
      const activeId = conversations.some(chat => chat.id === saved.history.activeId) ? saved.history.activeId : null;
      return { activeId, conversations };
    }
  } catch {
    // A fresh conversation is available when session storage is unavailable.
  }
  return emptyAssistantHistory;
}

export function saveAssistantHistory(role, history) {
  try {
    if (role) sessionStorage.setItem(KEY, JSON.stringify({ role, history }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Conversations are still available in the current page session.
  }
}
