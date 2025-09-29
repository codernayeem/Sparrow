import { useState } from 'react';
import Notification from './Notification';

const FollowButton = ({ userId, isFollowing: initialIsFollowing, onFollowChange, size = 'default' }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        
        if (onFollowChange) {
          onFollowChange(userId, newIsFollowing);
        }
        
        setNotification({
          show: true,
          message: data.message || (newIsFollowing ? 'User followed!' : 'User unfollowed!'),
          type: 'success'
        });
      } else {
        const errorData = await response.json();
        setNotification({
          show: true,
          message: errorData.error || 'Something went wrong',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Follow error:', error);
      setNotification({
        show: true,
        message: 'Failed to update follow status',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClasses = {
    small: 'px-3 py-1 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3'
  };

  const baseClasses = `${buttonClasses[size]} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  if (isFollowing) {
    return (
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`${baseClasses} bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600 hover:border-red-300 border border-gray-300`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>...</span>
          </div>
        ) : (
          'Following'
        )}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700 border border-blue-600`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>...</span>
          </div>
        ) : (
          'Follow'
        )}
      </button>

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </>
  );
};

export default FollowButton;