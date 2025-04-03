import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from "../utils/supabase";

import { checkHowLongMember } from '../utils/api';
import axios from 'axios';
import { User } from '@supabase/supabase-js';


function TwoFA() {

  const navigate = useNavigate()

  const [userData, setUserDate] = useState<User>();
  const [enteredCode, setCode] = useState('');
  const [invalidError, setInvalidError] = useState(false);
  const [expiredError, setExpiredError] = useState(false);

  //checking for existing user session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        async function fetchUserAndProfile() {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) {
              console.error("Error fetching user:", authError?.message);
              return;
          }

          setUserDate(authData.user);
      }

      fetchUserAndProfile();
      } else {
        navigate('/login');
      }
    });

    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  const handleSubmit = async () => {

    if(!userData) return;

    const response = await axios.post("http://localhost:3000/api/users/verify-2fa", {
      userId: userData.id,
      code: enteredCode
    });
  
    if (response.data.success == true) {
      let userId;
      let createdAt;
      let alertText;
  
      if(userData){
        userId = userData.id;
        createdAt = userData.created_at;
        alertText = await checkHowLongMember(userId, createdAt);
      }

      navigate('/welcome', { state: { alertText } })
    } else {
      return;
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Enter 2FA Code</h2>
  
        <input
          type="text"
          placeholder="6-digit code"
          value={enteredCode}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
  
        {invalidError && (
          <p className="text-red-600 text-sm mb-2">Invalid code. Please try again.</p>
        )}
  
        {expiredError && (
          <p className="text-orange-600 text-sm mb-2">Your code has expired. Please log in again.</p>
        )}
  
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Verify
        </button>
      </div>
    </div>
  );
  
}

export default TwoFA;
