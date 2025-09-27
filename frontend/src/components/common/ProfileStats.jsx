const ProfileStats = ({ user }) => {
  return (
    <div className="flex space-x-8">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{user.following?.length || 0}</div>
        <div className="text-sm text-gray-600">Following</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{user.followers?.length || 0}</div>
        <div className="text-sm text-gray-600">Followers</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{user.likedPosts?.length || 0}</div>
        <div className="text-sm text-gray-600">Liked Posts</div>
      </div>
    </div>
  );
};

export default ProfileStats;