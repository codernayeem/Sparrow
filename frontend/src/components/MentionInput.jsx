import React, { useState, useRef, useEffect } from 'react';

const MentionInput = ({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder, 
  className, 
  disabled = false,
  replyTo = null,
  onCancelReply = null 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/posts/search/users?query=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const users = await response.json();
        setSuggestions(users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);

    // Check for @ mention
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionStart(mentionMatch.index);
      setShowSuggestions(true);
      setSelectedIndex(0);
      searchUsers(query);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionQuery('');
      setMentionStart(-1);
    }
  };

  const insertMention = (user) => {
    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionQuery('');
    setMentionStart(-1);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPosition = beforeMention.length + user.username.length + 2;
      inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          insertMention(suggestions[selectedIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
    }

    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1">
      <div className="relative flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            style={{ top: "100%", marginTop: "4px" }}
          >
            {suggestions.map((user, index) => (
              <div
                key={user._id}
                onClick={() => insertMention(user)}
                className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <img
                  src={user.profileImg || "/default-avatar.png"}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={onCancelReply}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MentionInput;