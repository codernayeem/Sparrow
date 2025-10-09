import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Smile } from "lucide-react";
import Layout from "../../components/layout/Layout";
import PostFeed from "./PostFeed.jsx";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Inline post creation states
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);


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

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPostError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit for images)
    if (file.size > 5 * 1024 * 1024) {
      setPostError("Image must be less than 5MB");
      return;
    }

    setPostError("");
    setPostImage(file);
    setPostPreview(URL.createObjectURL(file));
  }
};

const handleVideoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      setPostError("Please select a video file");
      return;
    }

    // Validate file size (20MB limit for videos)
    if (file.size > 20 * 1024 * 1024) {
      setPostError("Video must be less than 20MB");
      return;
    }

    setPostError("");
    setPostImage(file);
    setPostPreview(URL.createObjectURL(file));
  }
};

const handlePostSubmit = async (e) => {
  e.preventDefault();
  if (!postText.trim() && !postImage) {
    setPostError("Post must have text or media");
    return;
  }

  setIsPosting(true);
  setPostError("");

  try {
    const formData = new FormData();
    if (postText.trim()) formData.append("text", postText.trim());
    if (postImage) formData.append("img", postImage);

    const res = await fetch("/api/posts/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to create post");
    }

    // Reset form
    setPostText("");
    setPostImage(null);
    setPostPreview(null);
    setIsExpanded(false);
    
    // Refresh posts
    fetchPosts(1);
    setPage(1);
    setHasMore(true);
  } catch (err) {
    console.error("Error creating post:", err);
    setPostError(err.message || "Failed to create post. Please try again.");
  } finally {
    setIsPosting(false);
  }
};

const removeImage = () => {
  setPostImage(null);
  setPostPreview(null);
  setPostError("");
};

const insertEmoji = (emoji) => {
  const textarea = textareaRef.current;
  if (textarea) {
    const cursorPosition = textarea.selectionStart;
    const textBefore = postText.slice(0, cursorPosition);
    const textAfter = postText.slice(cursorPosition);
    const newText = textBefore + emoji + textAfter;
    
    if (newText.length <= 280) {
      setPostText(newText);
      // Set cursor position after the emoji
      setTimeout(() => {
        textarea.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
        textarea.focus();
      }, 0);
    }
  }
  setShowEmojiPicker(false);
};

// Common emojis for quick access
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤏', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥'
];



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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
          <h1 className="text-xl font-bold text-gray-900 heading">Home</h1>
        </div>

        {/* Create Post Section */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <form onSubmit={handlePostSubmit}>
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
                <textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  onFocus={() => setIsExpanded(true)}
                  placeholder="What's happening?"
                  className="w-full text-xl text-gray-900 placeholder-gray-500 border-none outline-none resize-none bg-transparent"
                  style={{ minHeight: isExpanded ? '120px' : '60px' }}
                  maxLength={280}
                />
                
                {/* Character Count */}
                {isExpanded && (
                  <div className="text-sm text-gray-500 mb-3">
                    {postText.length}/280 characters
                  </div>
                )}

                {/* Image Preview */}
                {postPreview && (
                  <div className="relative mb-3">
                    {postImage?.type.startsWith("video/") ? (
                      <video
                        src={postPreview}
                        controls
                        className="max-h-64 w-full rounded-lg shadow-md"
                      />
                    ) : (
                      <img
                        src={postPreview}
                        alt="Preview"
                        className="max-h-64 w-full object-cover rounded-lg shadow-md"
                      />
                    )}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-90 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {postError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{postError}</p>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg emoji-picker-container">
                    <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="text-xl hover:bg-gray-200 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    {/* Image Upload */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="post-image-upload"
                    />
                    <label
                      htmlFor="post-image-upload"
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
                      title="Add image"
                    >
                      <Image className="w-5 h-5" />
                    </label>
                    
                    {/* Video Upload */}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="post-video-upload"
                    />
                    <label
                      htmlFor="post-video-upload"
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
                      title="Add video"
                    >
                      <Video className="w-5 h-5" />
                    </label>
                    
                    {/* Emoji Picker */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`emoji-picker-container flex items-center space-x-1 transition-colors ${
                        showEmojiPicker 
                          ? 'text-blue-600 bg-blue-50 rounded-full p-1' 
                          : 'text-blue-500 hover:text-blue-600'
                      }`}
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isPosting || (!postText.trim() && !postImage)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                      isPosting || (!postText.trim() && !postImage)
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                    }`}
                  >
                    {isPosting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </div>
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <PostFeed
          posts={posts}
          hasMore={hasMore}
          isLoadingPosts={isLoadingPosts}
          currentUser={user}
        />


      </div>
    </Layout>
  );
};

export default Dashboard;
