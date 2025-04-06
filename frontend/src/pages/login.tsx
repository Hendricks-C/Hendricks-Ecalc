import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from '../utils/supabase.ts'
import { AuthResponse } from '@supabase/supabase-js'
import Laptop from '../assets/laptop.png'
import { Turnstile } from '@marsidev/react-turnstile'

import currentBadges from '../utils/api.ts'

function Login() {
  const [email, setEmail] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [captchaKey, setCaptchaKey] = useState(0);

  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const navigate = useNavigate()

  //checking for existing user session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  //login user
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!captchaToken) {
      setCaptchaError('Please complete the captcha');
      return;
    }

    setCaptchaError(null);

    const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({ //call signin function from supabase
      email,
      password,
      options: { captchaToken },
    })

    //Reset the token after submission
    setCaptchaToken(null);
    
    // error handling
    if (error) {
      alert(error.message)
      setCaptchaKey((prev) => prev + 1); // Trigger re-render Turnstile component
      return
    }

    // success message
    console.log('logged in: ', data.user)

    let userId;
    let createdAt;
    let alertText;

    if(data.user){
      userId = data.user.id;
      createdAt = data.user.created_at;
      alertText = await checkHowLongMember(userId, createdAt);
    }

    console.log(alertText);
    navigate('/welcome', { state: { alertText } })
  }

  const checkHowLongMember = async (id:string, whenCreated:string) => {

    // Extract badge IDs
    const badgeIds = await currentBadges(id);

    const givenDate = new Date(whenCreated);
    const currentDate = new Date();

    const differenceInMonths = (currentDate.getMonth() + 1) - (givenDate.getMonth() + 1);
    const differenceInYear = (currentDate.getFullYear()) - (givenDate.getFullYear());

    let gotBadge = "";


    if (differenceInMonths >= 1 && differenceInYear == 0 && !badgeIds.includes(5)){
      const { error } = await supabase
      .from("user_badges")
      .insert({ user_id: id, badge_id: 5 });
  
      if (error) {
          console.error("Error inserting badge for user:", error.message);
          return;
      } else {
          gotBadge = "Happy 1 month on the site! You just unlocked the 1 month badge";
      }
  
    } else if (differenceInMonths >= 2 && differenceInYear == 0 && !badgeIds.includes(6)){
      const { error } = await supabase
      .from("user_badges")
      .insert({ user_id: id, badge_id: 6 });
  
      if (error) {
          console.error("Error inserting badge for user:", error.message);
          return;
      } else {
          gotBadge = "Happy 2 months on the site! You just unlocked the 2 months badge";
      }
    }

    return gotBadge;
  }

  return (
    <>
      <div className='flex items-center justify-evenly px-8'>

        {/* Left - Laptop Image */}
        <div className='w-1/2 flex justify-center'>
          <img src={Laptop} alt="laptop" className="w-full h-auto" />
        </div>

        {/* Right - Login Form */}
        <div className="w-full max-w-xl flex flex-col items-center  mt-5 px-4 sm:px-5 md:px-6">

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

              {/* COMPANY */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Company:</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>


              <div className='flex justify-center items-center'>
                <Turnstile
                  key={captchaKey} // Change this key to reset
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => { setCaptchaToken(token) }} />

                {captchaError && <p style={{ color: 'red', fontSize: '0.75rem' }}>{captchaError}</p>}
              </div>

              {/* Buttons */}
              <div className="flex flex-col justify-center gap-2 items-center mt-3">
                <button
                  className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 cursor-pointer hover:brightness-105"
                  type="submit">Login</button>
                <button
                  className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 cursor-pointer hover:brightness-105"
                  type="button">Skip</button>
              </div>

              {/* Link to register page */}
              <div className="mt-3 text-center text-sm text-gray-700">
                <p className="mb-1">
                  Don’t have an account?{" "}
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
    </>
  )
}

export default Login