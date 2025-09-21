const App = () => {

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Sparrow</h1>
          <p className="text-gray-600 mb-6">
            This is a sample Tailwind CSS page. Edit <code className="bg-gray-200 px-1 rounded">App.jsx</code> to get started!
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}

export default App
