import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <img 
          src="/logo.png" 
          alt="Sparrow Logo" 
          className="w-16 h-16 mx-auto mb-6"
        />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sign In
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-blue-800 mb-4">
            Sign In functionality is not implemented yet.
          </p>
          <p className="text-blue-600 text-sm">
            This is a placeholder page. Only the Sign Up feature is currently available.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignUpClick}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create New Account
          </button>
          
          <button
            onClick={handleHomeClick}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;