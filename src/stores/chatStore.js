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
    isLoadingMessages: false,
    subscribedChannels: [],
  }),

  actions: {
    listenForMessages(conversationId) {
      if (window.Echo && !this.subscribedChannels.includes(conversationId)) {
        this.subscribedChannels.push(conversationId);
        window.Echo.private(`chat.${conversationId}`)
          .listen('MessageSent', (e) => {
            const newMessage = e.message || e;

            // 1. Thêm vào cache nếu có (tự động cập nhật currentMessages nếu đang xem phòng này)
            if (this.messagesCache[conversationId]) {
              const isMyMessage = this.messagesCache[conversationId].some(m => (m._id || m.id) === (newMessage._id || newMessage.id));
              if (!isMyMessage) {
                this.messagesCache[conversationId].push(newMessage);
                
                // Gửi thông báo Đã Nhận (Deliver)
                if (window.Echo) {
                  api.post(`/conversations/${conversationId}/deliver`, { message_id: newMessage._id || newMessage.id })
                    .catch(err => console.error('Lỗi báo đã nhận:', err));
                }
              }
            }

            // 2. Cập nhật danh sách hội thoại bên trái
            const convIndex = this.conversations.findIndex(c => c.id === conversationId);
            if (convIndex !== -1) {
              this.conversations[convIndex].last_message = newMessage;
              this.conversations[convIndex].updated_at = newMessage.created_at;

              // Tăng unread nếu không phải phòng đang mở và không phải tin nhắn của mình
              const authStore = useAuthStore();
              if (this.activeConversationId !== conversationId && newMessage.sender_id !== authStore.user?.id) {
                this.conversations[convIndex].unread = (this.conversations[convIndex].unread || 0) + 1;
                
                import('./notificationStore.js').then(({ useNotificationStore }) => {
                  const notificationStore = useNotificationStore();
                  const conversation = this.conversations[convIndex];

                  let targetName = 'Ai đó';
                  let targetAvatar = '';
                  let isGroup = conversation.is_group;
                  let groupName = conversation.name || 'Nhóm';
                  
                  let actualSenderName = 'Ai đó';
                  if (conversation.participants) {
                    const sender = conversation.participants.find(p => p.user_id === newMessage.sender_id);
                    if (sender && sender.user) {
                      actualSenderName = sender.user.name;
                    }
                  }
                  
                  if (isGroup) {
                    targetName = groupName;
                    targetAvatar = conversation.avatar || '';
                  } else if (conversation.participants && authStore.user?.id) {
                    const participant = conversation.participants.find(p => p.user_id !== authStore.user.id);
                    if (participant && participant.user) {
                      targetName = participant.user.name || 'Ai đó';
                      targetAvatar = participant.user.avatar || '';
                    }
                  }
                  
                  if (!targetAvatar) {
                    targetAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(targetName || 'U') + '&background=random';
                  }

                  let contentDisplay = newMessage.content;
                  if (!contentDisplay && newMessage.type !== 'text') {
                     contentDisplay = 'Đã gửi tệp đính kèm';
                  }
                  notificationStore.showToast({
                    id: 'msg_' + (newMessage._id || newMessage.id),
                    type: 'NewMessageNoti',
                    data: {
                      is_group: isGroup,
                      group_name: groupName,
                      sender_name: targetName,
                      actual_sender_name: actualSenderName,
                      content: contentDisplay,
                      avatar: targetAvatar,
                      conversation_id: conversationId
                    }
                  });
                });
              }

              // Đưa lên đầu danh sách
              const [movedConv] = this.conversations.splice(convIndex, 1);
              this.conversations.unshift(movedConv);
            }
          })
          .listen('MessageDelivered', (e) => {
            const convIndex = this.conversations.findIndex(c => c.id === conversationId);
            if (convIndex !== -1 && this.conversations[convIndex].participants) {
                const p = this.conversations[convIndex].participants.find(p => p.user_id === e.user_id);
                if (p) {
                    if (!p.last_delivered_message_id || e.message_id > p.last_delivered_message_id) {
                        p.last_delivered_message_id = e.message_id;
                    }
                }
            }
          })
          .listen('MessageRead', (e) => {
            const convIndex = this.conversations.findIndex(c => c.id === conversationId);
            if (convIndex !== -1 && this.conversations[convIndex].participants) {
                const p = this.conversations[convIndex].participants.find(p => p.user_id === e.user_id);
                if (p) {
                    if (!p.last_read_message_id || e.message_id > p.last_read_message_id) {
                        p.last_read_message_id = e.message_id;
                        p.last_delivered_message_id = e.message_id;
                    }
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

    async createGroupConversation(name, userIds) {
      try {
        const response = await api.post('/groups', { name, user_ids: userIds });
        const conversation = response.data;
        
        await this.fetchConversations();
        this.activeConversationId = conversation.id;
        
        return conversation;
      } catch (error) {
        console.error('Lỗi tạo nhóm:', error);
        throw error;
      }
    },
    
    async addGroupMembers(conversationId, userIds) {
      try {
        const response = await api.post(`/groups/${conversationId}/members`, { user_ids: userIds });
        const updatedConversation = response.data;
        
        const index = this.conversations.findIndex(c => c.id === conversationId);
        if (index !== -1) {
          this.conversations[index] = updatedConversation;
        }
        return updatedConversation;
      } catch (error) {
        console.error('Lỗi thêm thành viên:', error);
        throw error;
      }
    },
    
    async removeGroupMember(conversationId, userId) {
      try {
        await api.delete(`/groups/${conversationId}/members/${userId}`);
        
        const index = this.conversations.findIndex(c => c.id === conversationId);
        if (index !== -1) {
          this.conversations[index].participants = this.conversations[index].participants.filter(p => p.user_id !== userId);
        }
      } catch (error) {
        console.error('Lỗi xoá thành viên:', error);
        throw error;
      }
    },
    
    async updateGroupInfo(conversationId, name, avatarFile) {
      try {
        const formData = new FormData();
        if (name) formData.append('name', name);
        if (avatarFile) formData.append('avatar', avatarFile);
        
        formData.append('_method', 'PUT');
        
        const response = await api.post(`/groups/${conversationId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const updatedConversation = response.data;
        const index = this.conversations.findIndex(c => c.id === conversationId);
        if (index !== -1) {
          this.conversations[index] = updatedConversation;
        }
        return updatedConversation;
      } catch (error) {
        console.error('Lỗi cập nhật thông tin nhóm:', error);
        throw error;
      }
    },

    async fetchConversations() {
      this.isLoading = true;
      try {
        const response = await api.get('/conversations');
        this.conversations = response.data;
        
        // Lắng nghe tất cả các phòng chat để nhận tin nhắn real-time mọi lúc
        this.conversations.forEach(conv => {
          this.listenForMessages(conv.id);
        });
      } catch (error) {
        console.error('Lỗi lấy danh sách hội thoại:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMessages(conversationId) {
      this.activeConversationId = conversationId;

      // Reset unread count when opening the conversation
      const convIndex = this.conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        this.conversations[convIndex].unread = 0;
      }

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
        this.currentMessages = this.messagesCache[conversationId];

        // 5. Gửi trạng thái Đã Xem
        if (fetchedMessages.length > 0) {
            const latestMsg = fetchedMessages[fetchedMessages.length - 1];
            api.post(`/conversations/${conversationId}/read`, { message_id: latestMsg._id || latestMsg.id })
              .catch(err => console.error('Lỗi báo đã xem:', err));
        }

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
        _id: tempId,
        id: tempId, // keep id for fallback
        conversation_id: conversationId,
        sender_id: authStore.user?.id, // ID của chính bạn
        content: content,
        type: 'text',
        created_at: new Date().toISOString(), // Lấy giờ hiện tại trên máy
        status: 'sending'
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
        realMessage.status = 'sent';

        // 4. TRÁO ĐỔI TIN NHẮN ẢO THÀNH TIN NHẮN THẬT
        if (this.activeConversationId === conversationId) {
          const index = this.currentMessages.findIndex(m => m._id === tempId || m.id === tempId);
          if (index !== -1) {
            const realExists = this.currentMessages.some(m => (m._id || m.id) === (realMessage._id || realMessage.id) && !String(m.id).startsWith('temp_'));
            if (realExists) {
              this.currentMessages.splice(index, 1); // Đã nhận qua Echo, xoá tin ảo
            } else {
              this.currentMessages[index] = realMessage; // Ghi đè bằng data thật
            }
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

        // NẾU LỖI: Cập nhật trạng thái thành failed
        if (this.activeConversationId === conversationId) {
          const index = this.currentMessages.findIndex(m => m._id === tempId || m.id === tempId);
          if (index !== -1) {
            this.currentMessages[index].status = 'failed';
          }
        }
        throw error;
      }
    },
    async sendFileMessage(conversationId, { attachments, content, msgType }) {
      const authStore = useAuthStore();

      // 1. Tạo tin nhắn ảo (Optimistic UI)
      const tempId = 'temp_file_' + Date.now();
      
      const metadata = attachments.length === 1 
        ? { file_name: attachments[0].file_name, file_size: attachments[0].file_size, file_type: attachments[0].file_type }
        : { file_count: attachments.length };
        
      const tempMessage = {
        _id: tempId,
        id: tempId,
        conversation_id: conversationId,
        sender_id: authStore.user?.id,
        content: content || null,
        type: msgType,
        metadata: metadata,
        attachments: attachments,
        created_at: new Date().toISOString(),
        status: 'sending',
      };

      if (this.activeConversationId === conversationId) {
        this.currentMessages.push(tempMessage);
      }

      try {
        // 2. Gửi lên server
        const response = await api.post(`/conversations/${conversationId}/messages`, {
          content: content || null,
          type: msgType,
          attachments: attachments,
        });

        const realMessage = response.data;
        realMessage.status = 'sent';

        // 3. Tráo tin nhắn ảo → tin nhắn thật
        if (this.activeConversationId === conversationId) {
          const idx = this.currentMessages.findIndex(m => m._id === tempId || m.id === tempId);
          if (idx !== -1) {
            const realExists = this.currentMessages.some(m => (m._id || m.id) === (realMessage._id || realMessage.id) && !String(m.id).startsWith('temp_'));
            if (realExists) {
              this.currentMessages.splice(idx, 1);
            } else {
              this.currentMessages[idx] = realMessage;
            }
          }
        }

        // 4. Cập nhật danh sách hội thoại
        const convIndex = this.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          this.conversations[convIndex].last_message = realMessage;
          this.conversations[convIndex].updated_at = realMessage.created_at;
          const [movedConv] = this.conversations.splice(convIndex, 1);
          this.conversations.unshift(movedConv);
        }

        return realMessage;
      } catch (error) {
        // Rollback: Đổi thành failed
        if (this.activeConversationId === conversationId) {
          const idx = this.currentMessages.findIndex(m => m._id === tempId || m.id === tempId);
          if (idx !== -1) this.currentMessages[idx].status = 'failed';
        }
        console.error('Lỗi gửi file:', error);
        throw error;
      }
    }
  }
});
