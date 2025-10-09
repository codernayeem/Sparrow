import { useState } from "react";

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (images and videos)
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Please select an image or video file");
        return;
      }

      // Validate file size (20MB limit for videos, 5MB for images)
      const maxSize = file.type.startsWith("video/") ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const limit = file.type.startsWith("video/") ? "20MB" : "5MB";
        setError(`File must be less than ${limit}`);
        return;
      }

      setError("");
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      setError("Post must have text or media");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (image) formData.append("img", image);

      const res = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create post");
      }

      setText("");
      setImage(null);
      setPreview(null);
      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Input */}
        <div>
          <textarea
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[120px] border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            maxLength={280}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {text.length}/280 characters
            </span>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors duration-200">
          <div className="text-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              {!preview ? (
                <>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload media
                    </p>
                    <p className="text-xs text-gray-500">
                      Images up to 5MB, Videos up to 20MB
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative">
                  {image && image.type.startsWith("video/") ? (
                    <video
                      src={preview}
                      controls
                      className="max-h-64 max-w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 max-w-full rounded-lg shadow-md"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                      setError("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to change media
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || (!text.trim() && !image)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              loading || (!text.trim() && !image)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
