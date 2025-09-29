import { useState, useEffect, useCallback } from 'react';
import FollowButton from './FollowButton';

const FollowersModal = ({ isOpen, onClose, userId, type, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const response = await fetch(`/api/users/${userId}/${endpoint}?page=${page}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data[endpoint] || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, fetchUsers]);

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      fetchUsers(pagination.currentPage + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {type} ({pagination.totalFollowers || pagination.totalFollowing || 0})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {user.profileImg ? (
                          <img 
                            src={user.profileImg} 
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">{user.fullName}</h4>
                        <p className="text-xs text-blue-600 truncate">@{user.username}</p>
                        
                        {user.location && (
                          <div className="flex items-center space-x-1 mt-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs text-gray-500 truncate">{user.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>
                            <span className="font-medium text-gray-900">{user.followers?.length || 0}</span> followers
                          </span>
                          <span>
                            <span className="font-medium text-gray-900">{user.following?.length || 0}</span> following
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {user._id !== currentUserId && (
                      <div className="ml-3">
                        <FollowButton
                          userId={user._id}
                          isFollowing={user.followers?.includes(currentUserId) || false}
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                  
                  {user.bio && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{user.bio}</p>
                  )}
                </div>
              ))}
              
              {/* Load More Button */}
              {pagination.hasNext && (
                <div className="pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-2 px-4 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5H15V13.5a1.5 1.5 0 00-3 0v3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No {type} yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;