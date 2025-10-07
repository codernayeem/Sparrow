import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import Sidebar from '../../components/layout/Sidebar';
import ConversationList from '../../components/messaging/ConversationList';
import ChatWindow from '../../components/messaging/ChatWindow';

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { connectSocket, disconnectSocket } = useSocket();

  useEffect(() => {
    // Fetch current user
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          // Connect socket for messaging
          console.log('Connecting socket for user:', userData._id);
          connectSocket(userData._id);
        } else {
          // Redirect to home if not authenticated
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        window.location.href = '/';
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [connectSocket]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleLogout = async () => {
    try {
      disconnectSocket();
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row">
      {/* Mobile Header - Always visible on mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          {selectedConversation ? (
            // Chat header with back button
            <>
              <button
                onClick={() => setSelectedConversation(null)}
                className="flex items-center space-x-2 text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Messages</span>
              </button>
              <div className="flex items-center space-x-2">
                <img
                  src={selectedConversation.participants[0]?.profileImg || '/demo_img/profile/cut-up-33.webp'}
                  alt={selectedConversation.participants[0]?.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-gray-900 truncate">
                  {selectedConversation.participants[0]?.fullName}
                </span>
              </div>
            </>
          ) : (
            // Messages list header
            <>
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <div className="flex items-center space-x-2">
                <img
                  src={currentUser?.profileImg || '/demo_img/profile/cut-up-33.webp'}
                  alt={currentUser?.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-80 flex-shrink-0 border-r border-gray-200">
        <Sidebar user={currentUser} onLogout={handleLogout} refreshTrigger={0} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex h-full md:h-screen">
        {/* Conversations List */}
        <div className={`${
          selectedConversation 
            ? 'hidden md:flex md:w-1/3' 
            : 'flex w-full md:w-1/3'
        } min-w-0 border-r border-gray-200 bg-white flex-col`}>
          <div className="hidden md:block sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?._id}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${
          selectedConversation 
            ? 'flex w-full md:flex-1' 
            : 'hidden md:flex md:flex-1'
        }`}>
          <ChatWindow 
            conversation={selectedConversation} 
            currentUser={currentUser}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;