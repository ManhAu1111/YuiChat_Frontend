import { defineStore } from 'pinia';
import api from '../services/api';

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentMessages: [],
    searchResults: [],
    activeConversationId: null,
    isLoading: false,
    isSearching: false,
  }),

  actions: {
    async searchUsers(keyword) {
      if (!keyword || keyword.trim() === '') {
        this.searchResults = [];
        return;
      }
      
      this.isSearching = true;
      try {
        const response = await api.get(`/search?q=${keyword}`);
        this.searchResults = response.data;
      } catch (error) {
        console.error('Lỗi tìm kiếm người dùng:', error);
      } finally {
        this.isSearching = false;
      }
    },

    async startConversation(targetUserId) {
      try {
        const response = await api.post('/1on1', { target_user_id: targetUserId });
        const conversation = response.data;
        
        // Cập nhật lại danh sách hội thoại để lôi phòng mới về
        await this.fetchConversations();
        
        // Kích hoạt phòng chat này
        this.activeConversationId = conversation.id;
        
        // Xóa kết quả tìm kiếm để đóng dropdown
        this.searchResults = [];
        
        return conversation;
      } catch (error) {
        console.error('Lỗi bắt đầu cuộc hội thoại:', error);
        throw error;
      }
    },

    async fetchConversations() {
      this.isLoading = true;
      try {
        const response = await api.get('/conversations');
        this.conversations = response.data;
      } catch (error) {
        console.error('Lỗi lấy danh sách hội thoại:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMessages(conversationId) {
      this.activeConversationId = conversationId;
      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        // Backend trả về phân trang, nên lấy data.data
        this.currentMessages = response.data.data || response.data;
      } catch (error) {
        console.error('Lỗi lấy tin nhắn:', error);
      }
    },

    async sendMessage(conversationId, content) {
      try {
        const response = await api.post(`/conversations/${conversationId}/messages`, {
          content: content,
          type: 'text'
        });
        
        const newMessage = response.data;
        
        // Cập nhật tin nhắn vào danh sách hiện tại nếu đang ở đúng phòng
        if (this.activeConversationId === conversationId) {
          this.currentMessages.push(newMessage);
        }

        // Cập nhật lastMessage trong danh sách hội thoại
        const convIndex = this.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          this.conversations[convIndex].last_message = newMessage;
          this.conversations[convIndex].updated_at = newMessage.created_at;
          
          // Đưa hội thoại lên đầu danh sách
          const [movedConv] = this.conversations.splice(convIndex, 1);
          this.conversations.unshift(movedConv);
        }
        
        return newMessage;
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        throw error;
      }
    }
  }
});
