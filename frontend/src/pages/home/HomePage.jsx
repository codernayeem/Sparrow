import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import images
import photo1 from '../../assets/images/photo1.jpg';
import photo2 from '../../assets/images/photo2.jpg';
import photo3 from '../../assets/images/photo3.jpg';
import photo4 from '../../assets/images/photo4.jpg';

const HomePage = () => {
  // Image carousel state
  const images = [photo1, photo2, photo3, photo4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Navigation functions
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Get previous and next image indices for floating previews
  const getPreviousImageIndex = () => {
    return currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
  };

  const getNextImageIndex = () => {
    return currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
  };

  const handleLogIn = () => {
    navigate('/signin');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Sparrow Logo" 
            className="w-8 h-8 mr-3"
          />
          <h1 className="text-2xl font-bold text-blue-600">Sparrow</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogIn}
            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium"
          >
            Log In
          </button>
          <button 
            onClick={handleSignUp}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Express Yourself Freely
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Sparrow helps you communicate securely and openly with the world.
            </p>
          </div>
          
          {/* Right side - Image Carousel */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl">
              {/* Carousel Container */}
              <div className="relative flex items-center justify-center">
                
                {/* Left Navigation Button - Outside image */}
                <button
                  onClick={goToPreviousImage}
                  className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-10 bg-transparent border-none p-3 rounded-full opacity-20 hover:opacity-90 hover:scale-125 transition-all duration-300"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Image Container with Floating Previews */}
                <div className="relative">
                  
                  {/* Left Floating Preview - Partial image */}
                  <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 z-5 opacity-70 hover:opacity-90 transition-opacity duration-300 overflow-hidden rounded-lg">
                    <img 
                      src={images[getPreviousImageIndex()]}
                      alt={`Previous - Image ${getPreviousImageIndex() + 1}`}
                      className="w-16 h-12 object-cover object-center shadow-lg cursor-pointer transform scale-110 -translate-x-1"
                      onClick={goToPreviousImage}
                      style={{
                        clipPath: 'inset(0 30% 0 0)'
                      }}
                    />
                  </div>

                  {/* Main Image */}
                  <div className="overflow-hidden rounded-2xl shadow-lg">
                    <img 
                      src={images[currentImageIndex]}
                      alt={`Sparrow Feature ${currentImageIndex + 1}`}
                      className="w-full h-auto max-h-80 object-cover transition-opacity duration-500"
                    />
                  </div>

                  {/* Right Floating Preview - Partial image */}
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 z-5 opacity-70 hover:opacity-90 transition-opacity duration-300 overflow-hidden rounded-lg">
                    <img 
                      src={images[getNextImageIndex()]}
                      alt={`Next - Image ${getNextImageIndex() + 1}`}
                      className="w-16 h-12 object-cover object-center shadow-lg cursor-pointer transform scale-110 translate-x-1"
                      onClick={goToNextImage}
                      style={{
                        clipPath: 'inset(0 0 0 30%)'
                      }}
                    />
                  </div>
                </div>

                {/* Right Navigation Button - Outside image */}
                <button
                  onClick={goToNextImage}
                  className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-10 bg-transparent border-none p-3 rounded-full opacity-20 hover:opacity-90 hover:scale-125 transition-all duration-300"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Image Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-blue-600 scale-110 shadow-md' 
                        : 'bg-gray-300 hover:bg-gray-400 hover:scale-105'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600">© 2025 Sparrow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;