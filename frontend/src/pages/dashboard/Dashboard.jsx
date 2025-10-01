import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "../createpost/CreatePost.jsx";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


const fetchPosts = async (pageNumber = 1) => {
  if (isLoadingPosts) return; // Prevent concurrent requests
  
  setIsLoadingPosts(true);
  try {
    const res = await fetch(`/api/posts/dashboard-posts?page=${pageNumber}&limit=4`);
    if (res.ok) {
      const data = await res.json();

      setPosts((prev) =>
        pageNumber === 1 ? data.posts : [...prev, ...data.posts]
      );

      setHasMore(pageNumber < data.totalPages);
    } else {
      console.error("Failed to fetch posts:", res.statusText);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  } finally {
    setIsLoadingPosts(false);
  }
};



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // User not authenticated, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
   
    fetchUser();
    fetchPosts(1);
  }, [navigate]);

  useEffect(() => {
    if (!hasMore || isLoadingPosts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingPosts) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const loader = document.getElementById("infinite-loader");
    if (loader) observer.observe(loader);

    return () => observer.disconnect();
  }, [hasMore, isLoadingPosts]);
useEffect(() => {
  if (page === 1) return; // already fetched on mount
  fetchPosts(page);
}, [page]);


  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Sparrow Logo"
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-xl font-bold text-blue-600">Sparrow</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.fullName}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard, {user?.fullName}!
          </h2>
          <p className="text-gray-600">
            You've successfully created your Sparrow account. Start exploring
            and sharing your thoughts.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Complete your profile and customize your presence on Sparrow.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5H15V13.5a1.5 1.5 0 00-3 0v3.75m7.5-3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Connect</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Find and follow interesting people to build your network.
            </p>
            <button
              onClick={() => navigate("/people")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Find People
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Create</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Share your thoughts and engage with the Sparrow community.
            </p>
            {/* <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Create Post
            </button> */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Post
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Today"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        {/* Posts Feed */}
        <div className="mt-8 space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-500">
              No posts yet. Be the first to share!
            </p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-4">
                {/* Post Header */}
                <div className="flex items-center mb-2">
                  <img
                    src={post.user.profileImg || "/default-avatar.png"}
                    alt={post.user.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">
                      {post.user.fullName}{" @"}
                      <span className="text-sm font-normal text-gray-500">
                        {post.user.username}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                {post.text && <p className="mb-2">{post.text}</p>}
                {post.img && (
                  <img
                    src={post.img}
                    alt="Post"
                    className="w-full rounded-lg max-h-96 object-cover mb-2"
                  />
                )}

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-2 border-t pt-2 text-sm text-gray-700">
                    {post.comments.map((c) => (
                      <p key={c._id}>
                        <span className="font-semibold">
                          {c.user.fullName}:
                        </span>{" "}
                        {c.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {hasMore && (
            <div
              id="infinite-loader"
              className="h-10 flex items-center justify-center"
            >
              {isLoadingPosts ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <p className="text-gray-500">Loading more...</p>
              )}
            </div>
          )}
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <CreatePost
                onPostCreated={() => {
                  setShowModal(false);
                  // Refresh posts to show the new one
                  fetchPosts(1);
                  setPage(1);
                  setHasMore(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
