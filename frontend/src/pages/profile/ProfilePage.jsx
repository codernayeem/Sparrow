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
  const [posts, setPosts] = useState([]);

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
      <div className="w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.fullName}</h1>
            <p className="text-sm text-gray-500">{posts.length} posts</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {user.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt={`${user.fullName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <span className="text-blue-600 font-bold text-xl">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
                
                {/* Follow/Edit Button */}
                {!isOwnProfile ? (
                  <FollowButton
                    userId={user._id}
                    isFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                    size="small"
                  />
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="mt-3 text-gray-900">{user.bio}</p>
              )}

              {/* Location and Website */}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a
                      href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-3 text-sm">
                <button
                  onClick={() => setFollowingModalOpen(true)}
                  className="hover:underline"
                >
                  <span className="font-bold text-gray-900">{user.following?.length || 0}</span>
                  <span className="text-gray-500 ml-1">Following</span>
                </button>
                <button
                  onClick={() => setFollowersModalOpen(true)}
                  className="hover:underline"
                >
                  <span className="font-bold text-gray-900">{user.followers?.length || 0}</span>
                  <span className="text-gray-500 ml-1">Followers</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <ProfilePosts 
          userId={user._id} 
          isOwnProfile={isOwnProfile} 
          currentUser={currentUser}
          onPostsChange={setPosts}
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

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
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
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto">
                        {user.profileImg ? (
                          <img
                            src={user.profileImg}
                            alt={user.fullName}
                            className="w-24 h-24 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                        {imageUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Where are you located?"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
