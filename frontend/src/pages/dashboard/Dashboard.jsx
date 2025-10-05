import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import CreatePost from "../createpost/CreatePost.jsx";
import PostFeed from "./PostFeed.jsx";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [user, setUser] = useState(null);
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
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/");
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


  return (
    <Layout>
      <div className="w-full bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
        </div>

        {/* Create Post Section */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {user?.profileImg ? (
                <img
                  src={user.profileImg}
                  alt={user.fullName}
                  className="w-12 h-12 object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <button
                onClick={() => setShowModal(true)}
                className="w-full text-left text-xl text-gray-500 placeholder-gray-500 border-none outline-none py-3"
              >
                What's happening?
              </button>
              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-4 text-blue-400">
                  {/* Media icons can be added here */}
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <PostFeed
          posts={posts}
          hasMore={hasMore}
          isLoadingPosts={isLoadingPosts}
          currentUser={user}
        />

        {/* Create Post Modal */}
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
    </Layout>
  );
};

export default Dashboard;
