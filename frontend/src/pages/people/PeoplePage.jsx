import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
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



  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex-1 max-w-2xl border-x border-gray-200 bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Connect</h1>
        </div>
        
        <div className="p-4">
          {/* Search Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Search People</h3>
            <PeopleSearch currentUserId={currentUser?._id} />
          </div>

          {/* Suggested Users */}
          {suggestedUsers.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Suggested for you</h3>
                  <span className="text-sm text-gray-500">Based on your network</span>
                </div>
                <div className="space-y-3">
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
            </div>
          )}

          {/* Empty State */}
          {suggestedUsers.length === 0 && (
            <div className="border-t border-gray-200 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1.5H15V13.5a1.5 1.5 0 00-3 0v3.75m7.5-3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No suggested users</h3>
              <p className="mt-1 text-gray-500">Check back later or use the search above to find people.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PeoplePage;