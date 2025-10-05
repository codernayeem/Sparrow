import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import FollowButton from '../../components/common/FollowButton';
import FollowersModal from '../../components/common/FollowersModal';
import CreatePost from "../createpost/CreatePost.jsx";
import ProfilePosts from './ProfilePosts';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
  });

  const navigate = useNavigate();
  const { username } = useParams();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);

          // If no username param, show current user's profile
          if (!username) {
            setUser(userData);
            setEditForm({
              fullName: userData.fullName,
              username: userData.username,
              email: userData.email,
              bio: userData.bio || "",
              location: userData.location || "",
              website: userData.website || "",
            });
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/");
      }
    };

    fetchCurrentUser();
  }, [navigate, username]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (username && currentUser) {
        try {
          const response = await fetch(`/api/users/profile/${username}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);

            // If viewing own profile, set edit form
            if (userData._id === currentUser._id) {
              setEditForm({
                fullName: userData.fullName,
                username: userData.username,
                email: userData.email,
                bio: userData.bio || "",
                location: userData.location || "",
                website: userData.website || "",
              });
            } else {
              // Check if current user is following this user
              setIsFollowing(userData.followers?.includes(currentUser._id) || false);
              
              // Fetch mutual followers if viewing another user's profile
              fetchMutualFollowers(userData._id);
            }
          } else {
            setError("User not found");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError("Failed to load profile");
        } finally {
          setIsLoading(false);
        }
      } else if (currentUser && !username) {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [username, currentUser]);

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setCurrentUser(data);
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setImageUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const response = await fetch("/api/users/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            profileImg: reader.result,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setCurrentUser(data);
          setSuccess("Profile image updated successfully!");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Failed to upload image");
        }
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
      setImageUploading(false);
    }
  };



  const fetchMutualFollowers = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/mutual`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMutualFollowers(data.mutualFollowers || []);
      }
    } catch (error) {
      console.error('Error fetching mutual followers:', error);
    }
  };

  const handleFollowChange = (userId, newIsFollowing) => {
    setIsFollowing(newIsFollowing);
    // Update the user's followers count in real-time
    setUser(prevUser => ({
      ...prevUser,
      followers: newIsFollowing 
        ? [...(prevUser.followers || []), currentUser._id]
        : (prevUser.followers || []).filter(id => id !== currentUser._id)
    }));
  };

  const isOwnProfile = currentUser && user && currentUser._id === user._id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Profile not found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:underline"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {user.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt={`${user.fullName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <span className="text-blue-600 font-bold text-2xl">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Image Upload Button (only for own profile) */}
              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2">
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                      {imageUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.fullName}
                  </h1>
                  <p className="text-blue-600 font-medium">@{user.username}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
                  <div className="flex flex-wrap gap-4 mt-2">
                    {user.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {user.location}
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <a
                          href={
                            user.website.startsWith("http")
                              ? user.website
                              : `https://${user.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 sm:mt-0 flex flex-col space-y-3">
                  {!isOwnProfile && mutualFollowers.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Followed by{" "}
                      {mutualFollowers.slice(0, 2).map((mutual, index) => (
                        <span key={mutual._id}>
                          <span className="font-medium text-gray-900">{mutual.fullName}</span>
                          {index < Math.min(mutualFollowers.length, 2) - 1 && ", "}
                        </span>
                      ))}
                      {mutualFollowers.length > 2 &&
                        ` and ${mutualFollowers.length - 2} others you follow`}
                    </div>
                  )}

                  {!isOwnProfile ? (
                    <FollowButton
                      userId={user._id}
                      isFollowing={isFollowing}
                      onFollowChange={handleFollowChange}
                      size="default"
                    />
                  ) : (
                    !isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              fullName: user.fullName,
                              username: user.username,
                              email: user.email,
                              bio: user.bio || "",
                              location: user.location || "",
                              website: user.website || "",
                            });
                            setError("");
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-4">
                <button
                  onClick={() => setFollowingModalOpen(true)}
                  className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="text-xl font-bold text-gray-900">{user.following?.length || 0}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </button>
                <button
                  onClick={() => setFollowersModalOpen(true)}
                  className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="text-xl font-bold text-gray-900">{user.followers?.length || 0}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </button>
                <div className="text-center p-2">
                  <div className="text-xl font-bold text-gray-900">{user.likedPosts?.length || 0}</div>
                  <div className="text-sm text-gray-600">Liked Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && isOwnProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your profile will be accessible at sparrow.com/@
                  {editForm.username}
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={160}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {editForm.bio.length}/160 characters
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Where are you based?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {editForm.location.length}/50 characters
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="https://your-website.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {editForm.website.length}/100 characters
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Member Since
              </h3>
              <p className="text-gray-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Today"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Account Status
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Profile Completion
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        40 + // Base completion for having name and email
                        (user.profileImg ? 20 : 0) +
                        (user.bio ? 20 : 0) +
                        (user.location ? 10 : 0) +
                        (user.website ? 10 : 0)
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(
                    40 + // Base completion for having name and email
                      (user.profileImg ? 20 : 0) +
                      (user.bio ? 20 : 0) +
                      (user.location ? 10 : 0) +
                      (user.website ? 10 : 0)
                  )}
                  %
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {!user.profileImg && "Add a profile picture. "}
                {!user.bio && "Add a bio. "}
                {!user.location && "Add your location. "}
                {!user.website && "Add your website. "}
                {user.profileImg &&
                  user.bio &&
                  user.location &&
                  user.website &&
                  "Profile complete!"}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Account ID
              </h3>
              <p className="text-gray-600 text-sm font-mono">{user._id}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isOwnProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z"
                  />
                </svg>
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate("/people")}
                className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Find Friends
              </button>

              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Create Post
              </button>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <ProfilePosts 
          userId={user._id} 
          isOwnProfile={isOwnProfile} 
          currentUser={currentUser}
          onPostUpdate={() => {
            setSuccess("Post updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
          }}
          onPostDelete={() => {
            setSuccess("Post deleted successfully!");
            setTimeout(() => setSuccess(""), 3000);
          }}
        />

        {/* Followers Modal */}
        <FollowersModal
          isOpen={followersModalOpen}
          onClose={() => setFollowersModalOpen(false)}
          userId={user._id}
          type="followers"
          currentUserId={currentUser?._id}
        />

        {/* Following Modal */}
        <FollowersModal
          isOpen={followingModalOpen}
          onClose={() => setFollowingModalOpen(false)}
          userId={user._id}
          type="following"
          currentUserId={currentUser?._id}
        />
        
        {/* Create Post Modal */}
        {showCreatePostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
                <button
                  onClick={() => setShowCreatePostModal(false)}
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
                    setShowCreatePostModal(false);
                    setSuccess("Post created successfully!");
                    setTimeout(() => setSuccess(""), 3000);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
