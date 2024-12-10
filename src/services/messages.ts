import { api } from "./api.service";

export async function getSentMessages() {
    return api.get(`messages/sent`);
}

export async function getInboxMessages() {
    return api.get(`messages/inbox`);
}

export async function getDeletedMessages() {
    return api.get(`messages/soft-delete`);
}

export async function getStarredMessages() {
    return api.get(`messages/starred`);
}

export async function getMessageById(messageId) {
    return api.get(`messages/${messageId}`);
}

export async function sendMessage(body) {
    return api.post(`messages`, body);
}

export async function starMessage(messageId, userId) {
    return api.post(`messages/${messageId}/star`, { userId })
}

export async function unstarMessage(messageId, userId) {
    return api.patch(`messages/${messageId}/star`, { userId })
}

export async function deleteMessageForme(messageId, userId) {
    return api.delete(`messages/${messageId}/soft-delete/me`, { data: userId })
}

export async function deleteMessageForAll(messageId, userId) {
    return api.delete(`messages/${messageId}/soft-delete/all`, { data: userId })
}

export async function markMessageAsRead(messageId, recipientId) {
    return api.patch(`messages/${messageId}/read`, null, { params: { recipientId } });
}

export async function markMessageAsUnread(messageId, recipientId) {
    return api.patch(`messages/${messageId}/unread`, null, { params: { recipientId } });
}

