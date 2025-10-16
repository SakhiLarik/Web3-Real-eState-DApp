import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();  
  const navigate = useNavigate();
  

  // Ref to the dropdown container to detect outside clicks
  const dropdownRef = useRef(null);

  // Your logout logic
  const handleLogout = (e) => {
     e.preventDefault();
    logout();
    navigate("/login");
  };

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown is open and the click is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener to the whole document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup: remove the event listener when the component is unmounted
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <div className="relative mx-4" ref={dropdownRef}>
      {/* 1. The Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <img src="/images/avatar male.png" className='rounded-circle p-1' alt="" />
      </button>

      {/* 2. The Dropdown Menu (Conditionally Rendered) */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1">
            {/* Using <a> tags as requested. Replace with <Link> if using a router. */}
            <a
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
            >
              Dashboard
            </a>
            <a
              href="/properties"
              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
            >
              My Properties
            </a>
            <a
              href="/history"
              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
            >
              My History
            </a>
            
            {/* A separator for visual clarity */}
            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;