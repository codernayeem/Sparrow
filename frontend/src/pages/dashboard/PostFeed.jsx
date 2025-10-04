// src/components/PostsFeed.jsx
import React from "react";
import { useState, useEffect } from "react";


const PostFeed = ({ posts, hasMore, isLoadingPosts, currentUser }) => {


    const [localPosts, setLocalPosts] = useState(posts);
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState({});

    useEffect(() => {
      setLocalPosts(posts);
    }, [posts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/like/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const updatedLikes = await res.json();

        setLocalPosts((prev) =>
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
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const updatedComments = await res.json();

        setLocalPosts((prev) =>
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



  return (
    <div className="mt-8 space-y-6">
      {localPosts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Be the first to share!</p>
      ) : (
        localPosts.map((post) => { 
            const isLiked = post.likes?.includes(currentUser?._id);
            return (
              <div key={post._id} className="bg-white rounded-lg shadow p-4 ">
                {/* Post Header */}
                <div className="flex items-center mb-2">
                  <img
                    src={post.user.profileImg || "/default-avatar.png"}
                    alt={post.user.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">
                      {post.user.fullName}
                      {" @"}
                      <span className="text-sm font-normal text-gray-500">
                        {post.user.username}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
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
                    {showComments[post._id] ? (
                      <div className="space-y-2">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="flex space-x-2">
                            <img
                              src={comment.user.profileImg || "/default-avatar.png"}
                              alt={comment.user.fullName}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <p className="font-semibold text-xs text-gray-900">
                                  {comment.user.fullName}
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
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        View all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {/* Post Actions: Like, Comment, Share */}
                <div className="flex items-center space-x-6 mt-3 pt-2 border-t border-gray-100 text-gray-500">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      isLiked ? "text-pink-500" : "hover:text-pink-500"
                    }`}
                  >
                    {isLiked ? (
                      <svg
                        className="w-5 h-5"
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
                        className="w-5 h-5"
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

                  {/* Comment */}
                  <button 
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center space-x-1 hover:text-green-600 transition-colors"
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.comments?.length || 0}</span>
                  </button>

                  {/* Share */}
                  <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>

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
            );})
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
  );
};

export default PostFeed;
