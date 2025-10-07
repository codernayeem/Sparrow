import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        console.log('ConversationList: New message received', message);
        // Update the conversation list to reflect the new message
        setConversations(prev => 
          prev.map(conversation => {
            if (conversation._id === message.conversation) {
              return {
                ...conversation,
                lastMessage: {
                  content: message.content,
                  createdAt: message.createdAt,
                  sender: message.sender
                },
                updatedAt: message.createdAt
              };
            }
            return conversation;
          })
        );
      };

      const handleConversationUpdate = (updatedConversation) => {
        setConversations(prev => {
          const existingIndex = prev.findIndex(conv => conv._id === updatedConversation._id);
          if (existingIndex !== -1) {
            // Update existing conversation
            const updated = [...prev];
            updated[existingIndex] = updatedConversation;
            // Sort by updatedAt to show most recent first
            return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          } else {
            // Add new conversation
            return [updatedConversation, ...prev];
          }
        });
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('conversationUpdated', handleConversationUpdate);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('conversationUpdated', handleConversationUpdate);
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchUsers(query);
    }, 300);
  };

  const startConversation = async (userId) => {
    try {
      const response = await fetch(`/api/messages/conversations/${userId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const conversation = await response.json();
        onSelectConversation(conversation);
        setSearchQuery('');
        setSearchResults([]);
        // Refresh conversations list
        fetchConversations();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    return message.content.length > 50 
      ? `${message.content.substring(0, 50)}...` 
      : message.content;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for users to message..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="border-b border-gray-200 max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => startConversation(user._id)}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer active:bg-gray-200 transition-colors"
              >
                <img
                  src={user.profileImg || '/demo_img/profile/cut-up-33.webp'}
                  alt={user.fullName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.fullName}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">@{user.username}</p>
                </div>
              </div>
            ))
          ) : !isSearching ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No users found
            </div>
          ) : null}
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No conversations</h3>
            <p className="mt-1 text-sm sm:text-base text-gray-500">Search for users to start a conversation!</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = conversation.participants[0];
            const isSelected = selectedConversationId === conversation._id;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-colors active:bg-gray-100 ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <img
                    src={otherUser?.profileImg || '/demo_img/profile/cut-up-33.webp'}
                    alt={otherUser?.fullName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {otherUser?.fullName}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    @{otherUser?.username}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage.sender?.fullName === otherUser?.fullName 
                        ? '' 
                        : 'You: '}
                      {formatLastMessage(conversation.lastMessage)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;