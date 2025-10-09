import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch("/api/users/suggested");
        if (response.ok) {
          const users = await response.json();
          setSuggestedUsers(users.slice(0, 3)); // Show only 3 users
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`/api/users/follow/${userId}`, {
        method: "POST",
      });
      if (response.ok) {
        // Update the user's follow status locally
        setSuggestedUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
        // Also update search results if user is in there
        setSearchResults((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users.slice(0, 5)); // Show only 5 results in sidebar
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleShowMore = () => {
    navigate("/people");
  };

  return (
    <div className="w-full p-4 space-y-4 h-screen overflow-y-auto border-l border-gray-200 bg-white shadow-sm">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search Sparrow"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mt-3 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-2 font-medium">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {user.profileImg ? (
                        <img
                          src={user.profileImg}
                          alt={user.fullName}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {user.fullName}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        @{user.username}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user._id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                        user.isFollowing
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {user.isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
                {searchResults.length === 5 && (
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={handleShowMore}
                      className="text-blue-500 text-sm hover:underline w-full text-left font-medium"
                    >
                      See all results
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-600 text-sm mt-2 font-medium">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Who to follow */}
      <div className="bg-gray-100 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3 heading">Who to follow</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
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
              <div
                key={user._id}
                className="flex items-center space-x-3 hover:bg-gray-200 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
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
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.fullName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    @{user.username}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(user._id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    user.isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleShowMore}
          className="text-blue-500 text-sm hover:underline mt-3 font-medium"
        >
          Show more
        </button>
      </div>

      {/* Terms and Privacy */}
      <div className="text-xs text-gray-500 space-y-1 px-4">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Cookie Policy
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">
            Accessibility
          </a>
          <a href="#" className="hover:underline">
            Ads info
          </a>
          <a href="#" className="hover:underline">
            More...
          </a>
        </div>
        <p className="mt-2">© 2025 Sparrow Corp.</p>
      </div>
    </div>
  );
};

export default RightSidebar;
