import { defineStore } from 'pinia';
import api from '../services/api';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentMessages: [],
    messagesCache: {},
    searchResults: [],
    activeConversationId: null,
    isLoading: false,
    isSearching: false,
  }),

  actions: {
    listenForMessages(conversationId) {
      if (window.Echo) {
        window.Echo.private(`chat.${conversationId}`)
          .listen('MessageSent', (e) => {

            // 1. Phải mở hộp lấy dữ liệu tin nhắn (nếu có)
            const newMessage = e.message || e;

            // 2. So sánh bằng ID của newMessage
            const isMyMessage = this.currentMessages.some(m => m.id === newMessage.id);

            if (!isMyMessage) {
              if (this.activeConversationId === conversationId) {
                this.currentMessages.push(newMessage); // Đẩy newMessage vào thay vì e
              }

              // Cập nhật danh sách hội thoại bên trái
              const convIndex = this.conversations.findIndex(c => c.id === conversationId);
              if (convIndex !== -1) {
                this.conversations[convIndex].last_message = newMessage; // Dùng newMessage
                this.conversations[convIndex].updated_at = newMessage.created_at;

                // Đưa lên đầu danh sách
                const [movedConv] = this.conversations.splice(convIndex, 1);
                this.conversations.unshift(movedConv);
              }
            }
          });
      }
    },

    leaveChannel(conversationId) {
      if (window.Echo) {
        window.Echo.leave(`chat.${conversationId}`);
      }
    },
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

      // 1. KIỂM TRA CACHE TRƯỚC
      // Nếu kho chứa đã có data của phòng này, lôi ra xài luôn và DỪNG LẠI (Không gọi API)
      if (this.messagesCache[conversationId]) {
        // Gán màn hình bằng mảng trong cache
        this.currentMessages = this.messagesCache[conversationId];
        return;
      }

      // 2. NẾU CACHE TRỐNG (Lần đầu mở) -> Dọn màn hình và gọi API
      this.currentMessages = [];
      this.isLoadingMessages = true;

      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        const fetchedMessages = response.data.data || response.data;

        // 3. LƯU VÀO CACHE BẢO QUẢN
        this.messagesCache[conversationId] = fetchedMessages;

        // 4. HIỂN THỊ RA MÀN HÌNH
        // (Lưu ý: Phải gán tham chiếu thẳng vào cache để sau này có tin mới nó tự update)
        this.currentMessages = this.messagesCache[conversationId];

      } catch (error) {
        console.error('Lỗi lấy tin nhắn:', error);
      } finally {
        this.isLoadingMessages = false;
      }
    },

    async sendMessage(conversationId, content) {
      const authStore = useAuthStore();

      // 1. TẠO TIN NHẮN ẢO (Fake Message)
      const tempId = 'temp_' + Date.now(); // Tạo ID tạm thời
      const tempMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: authStore.user?.id, // ID của chính bạn
        content: content,
        type: 'text',
        created_at: new Date().toISOString(), // Lấy giờ hiện tại trên máy
        is_sending: true // Đánh dấu là đang gửi (để mờ mờ tí nếu thích)
      };

      // 2. NHÉT NGAY VÀO MÀN HÌNH (Giao diện lạc quan)
      if (this.activeConversationId === conversationId) {
        this.currentMessages.push(tempMessage);
      }

      try {
        // 3. ÂM THẦM GỬI LÊN SERVER
        const response = await api.post(`/conversations/${conversationId}/messages`, {
          content: content,
          type: 'text'
        });

        const realMessage = response.data;

        // 4. TRÁO ĐỔI TIN NHẮN ẢO THÀNH TIN NHẮN THẬT
        if (this.activeConversationId === conversationId) {
          const index = this.currentMessages.findIndex(m => m.id === tempId);
          if (index !== -1) {
            this.currentMessages[index] = realMessage; // Ghi đè bằng data thật từ DB
          }
        }

        // 5. Cập nhật danh sách hội thoại bên trái
        const convIndex = this.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          this.conversations[convIndex].last_message = realMessage;
          this.conversations[convIndex].updated_at = realMessage.created_at;

          // Đưa hội thoại lên đầu danh sách
          const [movedConv] = this.conversations.splice(convIndex, 1);
          this.conversations.unshift(movedConv);
        }

        return realMessage;
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);

        // NẾU LỖI: Thu hồi lại tin nhắn ảo trên màn hình
        if (this.activeConversationId === conversationId) {
          this.currentMessages = this.currentMessages.filter(m => m.id !== tempId);
        }
        throw error;
      }
    }
  }
});
