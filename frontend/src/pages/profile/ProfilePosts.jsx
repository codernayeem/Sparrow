import { useState, useEffect } from 'react';

const ProfilePosts = ({ userId, isOwnProfile, currentUser, onPostUpdate, onPostDelete }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [visibilityChanging, setVisibilityChanging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState({});

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/user/${userId}`, {
          credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          setError("Failed to load posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [userId]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeleting(postId);
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        onPostDelete && onPostDelete();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditText(post.text);
  };

  const handleUpdatePost = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: editText }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, text: updatedPost.text } : post
        ));
        setEditingPost(null);
        setEditText("");
        onPostUpdate && onPostUpdate();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post");
    }
  };

  const handleVisibilityChange = async (postId, newVisibility) => {
    try {
      setVisibilityChanging(postId);
      const response = await fetch(`/api/posts/${postId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, visibility: updatedPost.visibility } : post
        ));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      setError("Failed to update visibility");
    } finally {
      setVisibilityChanging(null);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'followers':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5H15" />
          </svg>
        );
      case 'private':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'followers':
        return 'Followers only';
      case 'private':
        return 'Private';
      default:
        return 'Public';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/like/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const updatedLikes = await res.json();
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likes: updatedLikes } : post
          )
        );
      } else {
        console.error("Failed to like/unlike post");
      }
    } catch (err) {
      console.error("Error in like/unlike request:", err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    
    try {
      const res = await fetch(`/api/posts/comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const updatedComments = await res.json();

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, comments: updatedComments } : post
          )
        );

        // Clear the comment input
        setCommentText(prev => ({ ...prev, [postId]: "" }));
      } else {
        console.error("Failed to add comment");
      }
    } catch (err) {
      console.error("Error in comment request:", err);
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentText(prev => ({ ...prev, [postId]: text }));
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Posts ({posts.length})
        </h2>
        {posts.length > 0 && (
          <div className="text-sm text-gray-500">
            {isOwnProfile ? 'Your posts' : `Posts by ${currentUser?.fullName}`}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
          <p className="text-gray-500 text-lg mb-2">No posts yet</p>
          <p className="text-gray-400 text-sm">
            {isOwnProfile 
              ? "Share your thoughts with the world by creating your first post!" 
              : "This user hasn't posted anything yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = (post) => post.likes?.includes(currentUser?._id);

            return (
              <div
                key={post._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {post.user?.profileImg ? (
                        <img
                          src={post.user.profileImg}
                          alt={`${post.user.fullName}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100">
                          <span className="text-blue-600 font-medium text-sm">
                            {post.user?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.user?.fullName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>@{post.user?.username}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {getVisibilityIcon(post.visibility || "public")}
                          <span>
                            {getVisibilityLabel(post.visibility || "public")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu (only for own posts) */}
                  {isOwnProfile && (
                    <div className="flex items-center space-x-2">
                      {/* Visibility Dropdown */}
                      <div className="relative">
                        <select
                          value={post.visibility || "public"}
                          onChange={(e) =>
                            handleVisibilityChange(post._id, e.target.value)
                          }
                          disabled={visibilityChanging === post._id}
                          className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="followers">Followers only</option>
                          <option value="private">Private</option>
                        </select>
                        {visibilityChanging === post._id && (
                          <div className="absolute right-0 top-0 mt-1 mr-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit post"
                      >
                        <svg
                          className="w-4 h-4"
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
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        disabled={deleting === post._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Delete post"
                      >
                        {deleting === post._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-3">
                  {editingPost === post._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        rows={3}
                        maxLength={280}
                        placeholder="What's on your mind?"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {editText.length}/280 characters
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingPost(null);
                              setEditText("");
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdatePost(post._id)}
                            disabled={editText.trim().length === 0}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {post.text}
                    </p>
                  )}
                </div>

                {/* Post Image */}
                {post.img && (
                  <div className="mb-3">
                    <img
                      src={post.img}
                      alt="Post content"
                      className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center space-x-1 transition-colors ${
                        isLiked(post) ? "text-pink-500" : "hover:text-pink-500"
                      }`}
                    >
                      {isLiked(post) ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="none"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      )}
                      <span>{post.likes?.length || 0}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.comments?.length || 0}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span>Share</span>
                  </div>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {showComments[post._id] ? (
                      <div className="space-y-2 mb-3">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="flex space-x-2">
                            <img
                              src={comment.user?.profileImg || "/default-avatar.png"}
                              alt={comment.user?.fullName}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <p className="font-semibold text-xs text-gray-900">
                                  {comment.user?.fullName}
                                </p>
                                <p className="text-sm text-gray-800">{comment.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => toggleComments(post._id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Hide comments
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="text-sm text-gray-600 hover:text-gray-800 mb-3"
                      >
                        View all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {/* Comment Input Section */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <img
                      src={currentUser?.profileImg || "/default-avatar.png"}
                      alt={currentUser?.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText[post._id] || ""}
                          onChange={(e) => handleCommentTextChange(post._id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post._id);
                            }
                          }}
                          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          disabled={!commentText[post._id]?.trim() || isSubmittingComment[post._id]}
                          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingComment[post._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Post"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );})}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;