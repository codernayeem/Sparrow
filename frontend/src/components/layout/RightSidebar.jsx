import { useState, useEffect } from 'react';

const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch('/api/users/suggested');
        if (response.ok) {
          const users = await response.json();
          setSuggestedUsers(users.slice(0, 3)); // Show only 3 users
        }
      } catch (error) {
        console.error('Error fetching suggested users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`/api/users/follow/${userId}`, {
        method: 'POST',
      });
      if (response.ok) {
        // Update the user's follow status locally
        setSuggestedUsers(prev => 
          prev.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const trendingTopics = [
    { topic: '#ReactJS', posts: '15.2K posts' },
    { topic: '#WebDevelopment', posts: '8.7K posts' },
    { topic: '#TechNews', posts: '12.1K posts' },
    { topic: '#Programming', posts: '25.3K posts' },
  ];

  return (
    <div className="w-80 p-4 space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 bg-gray-50 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Sparrow"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* What's happening */}
      <div className="bg-gray-100 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">What's happening</h2>
        <div className="space-y-3">
          {trendingTopics.map((trend, index) => (
            <div key={index} className="cursor-pointer hover:bg-gray-200 rounded-lg p-2 -m-2 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Trending in Technology</p>
                  <p className="font-bold text-gray-900">{trend.topic}</p>
                  <p className="text-sm text-gray-500">{trend.posts}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="text-blue-500 text-sm hover:underline mt-3">
          Show more
        </button>
      </div>

      {/* Who to follow */}
      <div className="bg-gray-100 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Who to follow</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="w-16 h-8 bg-gray-300 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center space-x-3 hover:bg-gray-200 rounded-lg p-2 -m-2 transition-colors">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt={user.fullName}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {user.fullName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    @{user.username}
                  </p>
                </div>
                <button
                  onClick={() => handleFollow(user._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}
        <button className="text-blue-500 text-sm hover:underline mt-3">
          Show more
        </button>
      </div>

      {/* Terms and Privacy */}
      <div className="text-xs text-gray-500 space-y-1 px-4">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
          <a href="#" className="hover:underline">More...</a>
        </div>
        <p className="mt-2">© 2025 Sparrow Corp.</p>
      </div>
    </div>
  );
};

export default RightSidebar;