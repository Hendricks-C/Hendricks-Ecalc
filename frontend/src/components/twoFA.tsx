import { useState } from 'react';
import axios from 'axios';
import { checkHowLongMember } from '../utils/api';
import { User } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';

// Define interface for props
interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  navigate: NavigateFunction;
}

function TwoFAModal({ isOpen, onClose, userData, navigate }: TwoFAModalProps) {
  const [enteredCode, setCode] = useState('');
  const [invalidError, setInvalidError] = useState(false);
  const [expiredError, setExpiredError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    setInvalidError(false);
    setExpiredError(false);

    try {
      const response = await axios.post("http://localhost:3000/api/users/verify-2fa", {
        userId: userData.id,
        code: enteredCode
      });
    
      if (response.data.success === true) {
        let userId = userData.id;
        let createdAt = userData.created_at;
        let alertText = await checkHowLongMember(userId, createdAt);
        
        onClose();
        navigate('/welcome', { state: { alertText } });
      } else {
        setInvalidError(true);
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      // Do this check here and label it
      if (error) {
        setExpiredError(true);
      } else {
        setInvalidError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Enter 2FA Code</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          We've sent a verification code to your email.
        </p>
  
        <input
          type="text"
          placeholder="6-digit code"
          value={enteredCode}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {invalidError && (
          <p className="text-red-400 text-sm mb-2">Invalid code. Please try again.</p>
        )}
  
        {expiredError && (
          <p className="text-red-400 text-sm mb-2">Your code has expired. Please try again.</p>
        )}
  
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || enteredCode.length !== 6}
            className={`w-1/2 font-semibold py-2 px-4 rounded ${
              isLoading || enteredCode.length !== 6
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
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
