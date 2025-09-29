import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleSearch from '../../components/common/PeopleSearch';
import UserCard from '../../components/common/UserCard';

const PeoplePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        navigate('/');
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch('/api/users/suggested');
        if (response.ok) {
          const users = await response.json();
          setSuggestedUsers(users);
        }
      } catch (error) {
        console.error('Error fetching suggested users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchSuggestedUsers();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <button 
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img 
                src="/logo.png" 
                alt="Sparrow Logo" 
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-xl font-bold text-blue-600">Sparrow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {currentUser?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{currentUser?.fullName}</span>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover People</h2>
          <p className="text-gray-600">Find and connect with interesting people on Sparrow.</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search People</h3>
          <PeopleSearch currentUserId={currentUser?._id} />
        </div>

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Suggested for you</h3>
              <span className="text-sm text-gray-500">Based on your network</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {suggestedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  currentUserId={currentUser?._id}
                  showFollowButton={true}
                  showMutualInfo={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {suggestedUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5H15V13.5a1.5 1.5 0 00-3 0v3.75m7.5-3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No suggested users</h3>
            <p className="mt-1 text-gray-500">Check back later or use the search above to find people.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PeoplePage;