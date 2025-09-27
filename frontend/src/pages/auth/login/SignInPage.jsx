import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ needed for httpOnly cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard"); // ✅ redirect to dashboard after login
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="max-w-md w-full text-center lg:text-left">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Sparrow Logo"
              className="w-16 h-16 mx-auto lg:mx-0 mb-4"
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sign in to continue the conversation
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Fast & secure login</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Access your dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-50 lg:bg-white">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <img
              src="/logo.png"
              alt="Sparrow Logo"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">We’re glad to see you again</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="mb-4">
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
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50 text-gray-900"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don’t have an account?{" "}
              <button
                onClick={handleSignUpClick}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
