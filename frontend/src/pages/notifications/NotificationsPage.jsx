import Layout from '../../components/layout/Layout';

const NotificationsPage = () => {

  return (
    <Layout>
      <div className="flex-1 max-w-2xl border-x border-gray-200 bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1m0-4h4.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-gray-500">You're all caught up!</p>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;