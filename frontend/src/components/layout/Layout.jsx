import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import RightSidebar from '../../components/layout/RightSidebar';

// Create context for notification refresh
export const NotificationContext = createContext();

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshNotifications, setRefreshNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const triggerNotificationRefresh = () => {
    setRefreshNotifications(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ triggerNotificationRefresh }}>
      <div className="min-h-screen bg-white">
        {/* Mobile Navigation */}
        <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-50">
          <Sidebar user={user} onLogout={handleLogout} refreshTrigger={refreshNotifications} />
        </div>

        {/* Desktop Layout */}
        <div className="flex justify-center max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <div className="hidden md:flex md:w-64 lg:w-80 xl:w-80 flex-shrink-0">
            <Sidebar user={user} onLogout={handleLogout} refreshTrigger={refreshNotifications} />
          </div>
        
        {/* Main Content */}
        <main className="flex-1 max-w-2xl min-w-0 border-x border-gray-200">
          {children}
        </main>
        
          {/* Right Sidebar */}
          <div className="hidden lg:flex lg:w-80 xl:w-80 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export default Layout;