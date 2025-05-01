import { useState, useEffect } from 'react';
import axios from 'axios';
import { checkHowLongMember } from '../utils/api';
import { User } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';

/**
 * @interface TwoFAModalProps
 * @property {boolean} isOpen - Whether the modal should be shown.
 * @property {() => void} onClose - Callback to close the modal.
 * @property {User} userData - Current Supabase user object.
 * @property {NavigateFunction} navigate - React Router navigation function.
 */
interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  navigate: NavigateFunction;
}

/**
 * TwoFAModal Component
 *
 * Handles email-based 2FA verification, with timer-based expiration and code re-sending.
 * Locks user out if expired, gives real-time feedback, and checks badge eligibility on success.
 */
function TwoFAModal({ isOpen, onClose, userData, navigate }: TwoFAModalProps) {
  const [enteredCode, setCode] = useState('');
  const [invalidError, setInvalidError] = useState(false);
  const [expiredError, setExpiredError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Disable background scrolling when modal is open
  useEffect(() => {
    // When modal opens, disable background scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    // Always re-enable scrolling when modal unmounts or closes
    return () => {
      document.body.style.overflow = 'auto'; // reset on unmount
    };
  }, [isOpen]);

  /**
   * Starts countdown timer based on `2fa_expires_at` stored in localStorage.
   * Updates every second. When time runs out, shows expiration error.
   */
  useEffect(() => {
    // Do nothing if modal is not open
    if (!isOpen) return;

    // Get expiration timestamp from localStorage
    const expiresAtString = localStorage.getItem('2fa_expires_at');
    if (!expiresAtString) return;
  
    // Convert to Date and compute initial time difference
    const expiresAt = new Date(expiresAtString);
    const initialDiff = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  
    // If already expired, stop here
    if (initialDiff <= 0) {
      setTimeRemaining(0);
      setExpiredError(true);
      return;
    }
  
    // Set initial remaining time
    setTimeRemaining(initialDiff);

    // Start countdown interval
    const timer = setInterval(() => {
      const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        // Stop timer and show expiration error
        clearInterval(timer);
        setExpiredError(true);
        setTimeRemaining(0);
      } else {
        // Update countdown
        setTimeRemaining(remaining);
      }
    }, 1000);
  
    // Cleanup timer on unmount or modal close
    return () => clearInterval(timer);
  }, [isOpen, timeRemaining]);

  /**
   * Requests a new 2FA code from the backend, resets expiration, and restarts timer.
   */
  const sendNewCode = async () => {
    if (!userData) return;
  
    // Reset any expired state
    setExpiredError(false);
  
    // Call backend to send a new 2FA code
    const response = await axios.post(`${apiBase}/api/users/2FA`, {
      userEmail: userData.email,
      userId: userData.id
    });
  
    // If the backend returns a new expiration time, store and reset the timer
    if (response.data.expires_at) {
      localStorage.setItem('2fa_expires_at', response.data.expires_at);

       // Recalculate time left from new expiration
      const newTime = Math.floor((new Date(response.data.expires_at).getTime() - Date.now()) / 1000);
      setTimeRemaining(newTime);
    } else {
      // Fallback: just restart 10-minute timer
      setTimeRemaining(600);
    }
  };
  
  /**
   * Submits the 2FA code to verify user identity.
   * If valid: clear timer, optionally check badge eligibility, and redirect to homepage.
   */
  const handleSubmit = async () => {
    if (!userData) return;
    
    // Start loading state and clear previous errors
    setIsLoading(true);
    setInvalidError(false);
    setExpiredError(false);

    try {
      // Send code + user ID to backend for verification
      const response = await axios.post(`${apiBase}/api/users/verify-2fa`, {
        userId: userData.id,
        code: enteredCode
      });
    
      // If verification is successful
      if (response.data.success === true) {
        // Clear 2FA timer from localStorage
        localStorage.removeItem('2fa_expires_at');

        // Optionally show alert if user qualifies for a badge
        let userId = userData.id;
        let createdAt = userData.created_at;
        let alertText = await checkHowLongMember(userId, createdAt);
      
        // Close modal and redirect to homepage with optional alert
        onClose();
        navigate('/', { state: { alertText } });
      } else {
        // If backend response explicitly says failure
        setInvalidError(true);
      }
    } catch (error) {
      // Handle known backend error responses (invalid/expired code)
      if (axios.isAxiosError(error) && error.response) {
        console.error("2FA verification error:", error.response.data.error);
        const currentError = error.response.data.error;
    
        if (currentError === "expired") {
          setExpiredError(true);
        } else if (currentError === "invalid") {
          setInvalidError(true);
        }
      } else {
        // Unexpected error (network or server crash)
        console.error("Unexpected error during 2FA verification:", error);
      }
    } finally {
      // Stop loading indicator
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  // Format time remaining as MM:SS with leading zeros
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white mx-4 p-6 rounded-lg shadow-md w-full max-w-xl">

        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold text-center">Verification</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter code sent to email.</p>
        </div>
  
        {/* Code Input */}
        <input
          type="text"
          placeholder="6-digit code"
          value={enteredCode}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Countdown Timer */}
        <p className='text-lg text-gray-600 mb-4 text-center'> Code expires in: {formatTimeRemaining()}</p>
  
        {/* Error Messages */}
        {invalidError && (
          <p className="text-red-400 text-sm mb-2 text-center">Invalid code. Please try again.</p>
        )}
  
        {expiredError && (
          <>
            <div className='text-center'>
              <p className="text-red-400 text-sm">Your code has expired. Please try again.</p>
              <span onClick={sendNewCode} className='underline text-red-400 text-sm mb-2 cursor-pointer'> Send a new code!</span>
            </div>
          </>
        )}
  
        {/* Submit Button */}
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || enteredCode.length !== 6}
            className={`w-3/4 text-white font-semibold py-2 px-10 rounded-full transition duration-200 ${
              isLoading || enteredCode.length !== 6
                ? "bg-[#fff3a5] cursor-not-allowed"
                : "bg-[#FFE017] hover:brightness-105 cursor-pointer"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TwoFAModal;
