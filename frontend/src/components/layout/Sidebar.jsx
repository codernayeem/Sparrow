import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    {
      name: 'Home',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l-10 9h3v8h6v-6h2v6h6v-8h3l-10-9z"/>
        </svg>
      ),
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Notifications',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      ),
      path: '/notifications',
      active: location.pathname === '/notifications',
      badge: '3'
    },
    {
      name: 'Messages',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      ),
      path: '/messages',
      active: location.pathname === '/messages',
      badge: '2'
    },
    {
      name: 'Profile',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      path: '/profile',
      active: location.pathname === '/profile' || location.pathname.startsWith('/profile/')
    },
    {
      name: 'People',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7H17c-.8 0-1.54.37-2.01 1.02l-2.66 3.6C11.78 12.46 11 13.89 11 15.5V22h2v-6.5c0-.83.34-1.58.88-2.12L15.5 12 17 14.5V22h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 1H5c-.8 0-1.54.37-2.01 1.02l-2.66 3.6C.78 12.46 1 13.89 1 15.5V22h2v-6.5c0-.83.34-1.58.88-2.12L5.5 12 7 14.5V22h3v-7.5c0-1.61-.78-3.04-1.33-3.88l-2.66-3.6A1.5 1.5 0 0 0 4.5 7H3c-.8 0-1.54.37-2.01 1.02l-2.66 3.6C-2.22 12.46-2 13.89-2 15.5V22h2v-6.5c0-.83.34-1.58.88-2.12L2.5 12 4 14.5V22h3v-7.5c0-1.61-.78-3.04-1.33-3.88l-2.66-3.6A1.5 1.5 0 0 0-1.5 7z"/>
        </svg>
      ),
      path: '/people',
      active: location.pathname === '/people'
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
          <h1 className="text-xl font-bold text-blue-600">Sparrow</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-full bg-white flex flex-col h-screen transition-transform duration-300 ease-in-out md:sticky md:top-0 border-r border-gray-200`}>
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-6">
          <div className="flex items-center">
            <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-xl font-bold text-blue-600 hidden xl:block">Sparrow</h1>
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Sparrow Logo" className="w-8 h-8 mr-3" />
            <h1 className="text-xl font-bold text-blue-600">Sparrow</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full transition-all duration-200 group ${
                item.active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <div className={`${item.active ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {item.icon}
                </div>
                <span className="ml-5 text-xl font-normal hidden xl:block">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center hidden xl:flex">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          
          {/* Post Button */}
          <div className="pt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-lg xl:block hidden"
            >
              Post
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="xl:hidden w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between p-3 rounded-full hover:bg-gray-100 transition-colors duration-200">
            {/* Profile Section - Clickable */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center flex-1 text-left"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {user?.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt={user.fullName}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 hidden xl:block text-left">
                <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{user?.fullName}</p>
                <p className="text-sm text-gray-500 truncate max-w-[120px]">@{user?.username}</p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  onLogout();
                }
              }}
              className="hidden xl:block p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
              title="Logout"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="xl:hidden w-full mt-2 flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-red-500">Logout</span>
          </button>
        </div>
    </div>
    </>
  );
};

export default Sidebar;