// src/components/PostsFeed.jsx
import React from "react";
import { useState, useEffect } from "react";
import MentionInput from "../../components/MentionInput";


const PostFeed = ({ posts, hasMore, isLoadingPosts, currentUser }) => {


    const [localPosts, setLocalPosts] = useState(posts);
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState({});
    const [replyingTo, setReplyingTo] = useState({});
    const [showReplies, setShowReplies] = useState({});

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
        credentials: "include",
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
        credentials: "include",
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

  const handleReply = async (postId, commentId, replyToUserId) => {
    const text = commentText[`${postId}_${commentId}`]?.trim();
    if (!text) return;

    setIsSubmittingComment(prev => ({ ...prev, [`${postId}_${commentId}`]: true }));
    
    try {
      const res = await fetch(`/api/posts/reply/${postId}/${commentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, replyToUserId }),
      });

      if (res.ok) {
        const updatedComments = await res.json();

        setLocalPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, comments: updatedComments } : post
          )
        );

        // Clear the reply input and reset reply state
        setCommentText(prev => ({ ...prev, [`${postId}_${commentId}`]: "" }));
        setReplyingTo(prev => ({ ...prev, [`${postId}_${commentId}`]: null }));
      } else {
        console.error("Failed to add reply");
      }
    } catch (err) {
      console.error("Error in reply request:", err);
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [`${postId}_${commentId}`]: false }));
    }
  };

  const startReply = (postId, commentId, user) => {
    setReplyingTo(prev => ({ ...prev, [`${postId}_${commentId}`]: user }));
    // Pre-fill with @username
    setCommentText(prev => ({ ...prev, [`${postId}_${commentId}`]: `@${user.username} ` }));
  };

  const cancelReply = (postId, commentId) => {
    setReplyingTo(prev => ({ ...prev, [`${postId}_${commentId}`]: null }));
    setCommentText(prev => ({ ...prev, [`${postId}_${commentId}`]: "" }));
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderMentions = (text) => {
    if (!text) return text;
    
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.match(/^@\w+$/)) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };



  return (
    <div>
      {localPosts.length === 0 ? (
        <div className="p-8 text-center border-b border-gray-200">
          <p className="text-gray-500">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        localPosts.map((post) => { 
            const isLiked = post.likes?.includes(currentUser?._id);
            return (
              <div key={post._id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex space-x-3">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {post.user.profileImg ? (
                      <img
                        src={post.user.profileImg}
                        alt={post.user.fullName}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {post.user.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-900 hover:underline cursor-pointer">
                        {post.user.fullName}
                      </h3>
                      <span className="text-gray-500">@{post.user.username}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Text Content */}
                    {post.text && (
                      <div className="mb-3">
                        <p className="text-gray-900 text-base leading-normal whitespace-pre-wrap">
                          {post.text}
                        </p>
                      </div>
                    )}

                    {/* Image Content */}
                    {post.img && (
                      <div className="mb-3">
                        <img
                          src={post.img}
                          alt="Post"
                          className="w-full rounded-2xl max-h-96 object-cover border border-gray-200"
                        />
                      </div>
                    )}

                {/* Comments */}
                {post.comments.length > 0 && showComments[post._id] && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="space-y-2">
                          {/* Main Comment */}
                          <div className="flex space-x-2">
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
                                <p className="text-sm text-gray-800">
                                  {renderMentions(comment.text)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                <button
                                  onClick={() => startReply(post._id, comment._id, comment.user)}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  Reply
                                </button>
                                {comment.replies && comment.replies.length > 0 && (
                                  <button
                                    onClick={() => toggleReplies(comment._id)}
                                    className="hover:text-blue-600 transition-colors"
                                  >
                                    {showReplies[comment._id] ? 'Hide' : 'View'} {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && showReplies[comment._id] && (
                            <div className="ml-8 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex space-x-2">
                                  <img
                                    src={reply.user.profileImg || "/default-avatar.png"}
                                    alt={reply.user.fullName}
                                    className="w-5 h-5 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                                      <p className="font-semibold text-xs text-gray-900">
                                        {reply.user.fullName}
                                      </p>
                                      <p className="text-sm text-gray-800">
                                        {renderMentions(reply.text)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo[`${post._id}_${comment._id}`] && (
                            <div className="ml-8">
                              <div className="flex space-x-2">
                                <img
                                  src={currentUser?.profileImg || "/default-avatar.png"}
                                  alt={currentUser?.fullName}
                                  className="w-6 h-6 rounded-full"
                                />
                                <MentionInput
                                  value={commentText[`${post._id}_${comment._id}`] || ""}
                                  onChange={(text) => setCommentText(prev => ({ ...prev, [`${post._id}_${comment._id}`]: text }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleReply(post._id, comment._id, replyingTo[`${post._id}_${comment._id}`]._id);
                                    }
                                  }}
                                  placeholder="Write a reply..."
                                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                  disabled={isSubmittingComment[`${post._id}_${comment._id}`]}
                                  replyTo={replyingTo[`${post._id}_${comment._id}`]}
                                  onCancelReply={() => cancelReply(post._id, comment._id)}
                                />
                                <button
                                  onClick={() => handleReply(post._id, comment._id, replyingTo[`${post._id}_${comment._id}`]._id)}
                                  disabled={!commentText[`${post._id}_${comment._id}`]?.trim() || isSubmittingComment[`${post._id}_${comment._id}`]}
                                  className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isSubmittingComment[`${post._id}_${comment._id}`] ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    "Reply"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Hide comments
                      </button>
                    </div>
                  </div>
                )}

                    {/* Post Actions - Twitter Style */}
                    <div className="flex items-center justify-between max-w-md mt-3 text-gray-500">
                      {/* Comment */}
                      <button 
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center space-x-2 hover:text-blue-500 transition-colors group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-sm">{post.comments?.length || 0}</span>
                      </button>

                      {/* Retweet */}
                      <button className="flex items-center space-x-2 hover:text-green-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <span className="text-sm">0</span>
                      </button>

                      {/* Like */}
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-2 transition-colors group ${
                          isLiked ? "text-red-500" : "hover:text-red-500"
                        }`}
                      >
                        <div className={`p-2 rounded-full transition-colors ${
                          isLiked ? "bg-red-50" : "group-hover:bg-red-50"
                        }`}>
                          {isLiked ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{post.likes?.length || 0}</span>
                      </button>

                      {/* Share */}
                      <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </div>
                      </button>
                    </div>


                    {/* Comment Input Section */}
                    <div className="mt-3 pt-3">
                      <div className="flex space-x-2">
                        <img
                          src={currentUser?.profileImg || "/default-avatar.png"}
                          alt={currentUser?.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex space-x-2">
                            <MentionInput
                              value={commentText[post._id] || ""}
                              onChange={(text) => handleCommentTextChange(post._id, text)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(post._id);
                                }
                              }}
                              placeholder="Write a comment..."
                              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                              disabled={isSubmittingComment[post._id]}
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
                </div>
              </div>
            );
        })
      )}
      {hasMore && (
        <div
          id="infinite-loader"
          className="h-10 flex items-center justify-center border-b border-gray-200"
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
