import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';

const ChatWindow = ({ conversation, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, joinConversation, leaveConversation, emitTyping } = useSocket();

  const otherUser = conversation?.participants?.[0];

  useEffect(() => {
    if (conversation?._id) {
      fetchMessages();
      joinConversation(conversation._id);

      return () => {
        if (conversation?._id) {
          leaveConversation(conversation._id);
        }
      };
    }
  }, [conversation?._id, joinConversation, leaveConversation]);

  useEffect(() => {
    if (socket && conversation?._id) {
      console.log('Setting up socket listeners for conversation:', conversation._id);
      
      const handleNewMessage = (message) => {
        console.log('🔔 Received new message event:', message);
        if (message.conversation === conversation._id) {
          console.log('✅ Message is for current conversation, adding to state');
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            if (prev.some(msg => msg._id === message._id)) {
              console.log('⚠️ Message already exists, skipping');
              return prev;
            }
            console.log('📩 Adding new message to state');
            return [...prev, message];
          });
        } else {
          console.log('❌ Message not for current conversation');
        }
      };

      const handleUserTyping = ({ userId, isTyping }) => {
        console.log('⌨️ Typing event:', { userId, isTyping });
        if (userId !== currentUser?._id) {
          setTyping(isTyping);
          if (isTyping) {
            // Clear typing after 3 seconds
            setTimeout(() => setTyping(false), 3000);
          }
        }
      };

      const handleMessageDeleted = ({ messageId }) => {
        console.log('🗑️ Message deleted event:', messageId);
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      };

      const handleConversationDeleted = ({ conversationId }) => {
        console.log('🗑️ Conversation deleted event:', conversationId);
        if (conversationId === conversation._id) {
          // Navigate back to conversation list if current conversation is deleted
          if (onBack) {
            onBack();
          }
        }
      };

      // Remove any existing listeners to prevent duplicates
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageDeleted');
      socket.off('conversationDeleted');

      // Add new listeners
      socket.on('newMessage', handleNewMessage);
      socket.on('userTyping', handleUserTyping);
      socket.on('messageDeleted', handleMessageDeleted);
      socket.on('conversationDeleted', handleConversationDeleted);

      console.log('✅ Socket listeners registered');

      return () => {
        console.log('🧹 Cleaning up socket listeners');
        socket.off('newMessage', handleNewMessage);
        socket.off('userTyping', handleUserTyping);
        socket.off('messageDeleted', handleMessageDeleted);
        socket.off('conversationDeleted', handleConversationDeleted);
      };
    } else {
      console.log('❌ Socket or conversation not available:', { socket: !!socket, conversationId: conversation?._id });
    }
  }, [socket, conversation?._id, currentUser?._id, onBack]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversation?._id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/messages/${conversation._id}/messages`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation?._id) return;

    setSending(true);
    emitTyping(conversation._id, false); // Stop typing indicator

    try {
      const response = await fetch(`/api/messages/${conversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        console.log('Message sent successfully:', sentMessage);
        setNewMessage('');
        
        // If socket is not working, manually add the message
        setTimeout(() => {
          setMessages(prev => {
            if (!prev.some(msg => msg._id === sentMessage._id)) {
              return [...prev, sentMessage];
            }
            return prev;
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing indicator
    emitTyping(conversation._id, true);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      emitTyping(conversation._id, false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Select a conversation</h3>
          <p className="mt-1 text-gray-500">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header - Hidden on mobile since we have it in MessagesPage */}
      <div className="hidden md:flex items-center p-4 border-b border-gray-200 bg-white">
        <img
          src={otherUser?.profileImg || '/demo_img/profile/cut-up-33.webp'}
          alt={otherUser?.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3 min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900 truncate">{otherUser?.fullName}</h2>
          <p className="text-sm text-gray-500 truncate">@{otherUser?.username}</p>
        </div>
        
        {typing && (
          <div className="flex items-center space-x-1 text-sm text-blue-500 ml-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>typing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm sm:text-base">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender._id === currentUser?._id;
            const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);

            return (
              <div key={message._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={`Message ${otherUser?.fullName}...`}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px]"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;