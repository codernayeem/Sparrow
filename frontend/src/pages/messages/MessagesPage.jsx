import Layout from '../../components/layout/Layout';

const MessagesPage = () => {

  return (
    <Layout>
      <div className="flex-1 max-w-2xl border-x border-gray-200 bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No messages</h3>
          <p className="mt-1 text-gray-500">Start a conversation!</p>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;