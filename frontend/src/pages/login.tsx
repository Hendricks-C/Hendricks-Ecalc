import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import supabase from '../utils/supabase';
import { AuthResponse, User } from '@supabase/supabase-js';
import Laptop from '../assets/laptop.png';
import { Turnstile } from '@marsidev/react-turnstile';
import TwoFAModal from '../components/twoFA'; // Import the new modal component
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState<number>(0);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // New state for 2FA modal
  const [showTwoFAModal, setShowTwoFAModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const navigate = useNavigate();

  //login user
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);

    if (!captchaToken) {
      setCaptchaError('Please complete the captcha');
      setIsLoading(false);
      return;
    }

    setCaptchaError(null);

    try {
      const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });

      //Reset the token after submission
      setCaptchaToken(null);
      
      // error handling
      if (error) {
        alert(error.message);
        setCaptchaKey((prev) => prev + 1); // Trigger re-render Turnstile component
        setIsLoading(false);
        return;
      }

      // success message
      console.log('logged in: ', data.user);

      if(!data.user) {
        setIsLoading(false);
        return;
      }

      // Send 2FA code but don't navigate away - instead show the modal
      await axios.post("http://localhost:3000/api/users/2FA", {
        userEmail: data.user.email,
        userId: data.user.id
      });

      // Set the current user and show the 2FA modal
      setCurrentUser(data.user);
      
      setShowTwoFAModal(true);
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='flex items-center justify-evenly px-8 mb-5 sm:mb-10'>

        {/* Left - Laptop Image */}
        <div className='w-1/2 hidden lg:flex justify-center'>
          <img src={Laptop} alt="laptop" className="w-full h-auto" />
        </div>

        {/* Right - Login Form */}
        <div className="w-full max-w-xl flex flex-col items-center mt-5 px-4 sm:px-5 md:px-6">

          {/* Title Section */}
          <div className="mb-4 text-center">
            <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
              Information
            </h1>
            <h2 className="text-white text-sm sm:text-xl font-medium font-bitter mt-1">
              Fill in the fields below
            </h2>
          </div>

          {/* Login form */}
          <div className="w-full bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* EMAIL */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Email:</label>
                <input
                  type="text"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Password:</label>
                <input
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>

              <div className='flex justify-center items-center'>
                <Turnstile
                  key={captchaKey}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => { setCaptchaToken(token) }} 
                />

                {captchaError && <p style={{ color: 'red', fontSize: '0.75rem' }}>{captchaError}</p>}
              </div>

              {/* Buttons */}
              <div className="flex flex-col justify-center gap-2 items-center mt-3">
                <button
                  className={`bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:brightness-105'
                  }`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              {/* Link to register page */}
              <div className="mt-3 text-center text-sm text-gray-700">
                <p className="mb-1">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-[#95C6A9] hover:underline">
                    Create one now.
                  </Link>
                </p>
                <p>
                  Forgot your password?{" "}
                  <Link to="/forgot-password" className="text-[#95C6A9] hover:underline">
                    Reset it here.
                  </Link>
                </p>
              </div>

            </form>

          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <TwoFAModal 
        isOpen={showTwoFAModal} 
        onClose={() => setShowTwoFAModal(false)} 
        userData={currentUser}
        navigate={navigate}
      />
    </>
  );
}

export default Login;