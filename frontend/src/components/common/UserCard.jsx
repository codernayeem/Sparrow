import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

const UserCard = ({ user, currentUserId, showFollowButton = true, showMutualInfo = false }) => {
  const navigate = useNavigate();
  const [followingStatus, setFollowingStatus] = useState(
    user.followers?.includes(currentUserId) || false
  );

  const handleFollowChange = (userId, isFollowing) => {
    setFollowingStatus(isFollowing);
  };

  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const isOwnProfile = user._id === currentUserId;

  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {user.profileImg ? (
              <img 
                src={user.profileImg} 
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <span className="text-blue-600 font-medium">
                  {user.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">{user.fullName}</h4>
              {showMutualInfo && user.mutualCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {user.mutualCount} mutual
                </span>
              )}
            </div>
            <p className="text-sm text-blue-600 truncate">@{user.username}</p>
            
            {user.location && (
              <div className="flex items-center space-x-1 mt-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-500 truncate">{user.location}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>
                <span className="font-medium text-gray-900">{user.followers?.length || 0}</span> followers
              </span>
              <span>
                <span className="font-medium text-gray-900">{user.following?.length || 0}</span> following
              </span>
            </div>
          </div>
        </div>
        
        {showFollowButton && !isOwnProfile && (
          <div onClick={(e) => e.stopPropagation()}>
            <FollowButton
              userId={user._id}
              isFollowing={followingStatus}
              onFollowChange={handleFollowChange}
              size="small"
            />
          </div>
        )}
      </div>
      
      {user.bio && (
        <p className="text-sm text-gray-500 mt-3 line-clamp-2">{user.bio}</p>
      )}
    </div>
  );
};

export default UserCard;