import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from '../utils/supabase.ts'
import { AuthResponse } from '@supabase/supabase-js'

import currentBadges from '../utils/api.ts'

function Login() {
  const [email, setEmail] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  //checking for existing user session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/welcome");
      }
    });
  
    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  //login user
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({ //call signin function from supabase
      email,
      password,
    })

    // error handling
    if (error) {
      alert(error.message)
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
      <div className='flex flex-row justify-evenly items-center'>
        <div>
          <img src="../assets/react.svg" alt="Hendricks Foundation" />
        </div>
        <div className="flex flex-col items-center">
            <h1>Login</h1>
            <h2>Fill in the fields below</h2>
            <div className="p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="flex">Email:</label>
                        <input
                        type="text"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                    </div>
                    <div>
                        <label className="flex">Company:</label>
                        <input
                        type="text"
                        placeholder="Optional"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                    </div>
                    <div>
                        <label className="flex">Password:</label>
                        <input
                        type="password"
                        placeholder="**********"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-2 items-center">
                        <button className="border p-1 w-1/2 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Login</button>
                        <button className="border p-1 w-1/2 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="button">Skip</button>
                    </div>
                    <div>
                        <p>Don't have an account? <Link to="/register" className='no-underline hover:underline text-blue-500'>Create one now.</Link></p>
                        <p>Forgot your password? <Link to="/forgot-password" className='no-underline hover:underline text-blue-500'>Reset it here.</Link></p>
                    </div>
                </form>
                
            </div>
        </div>
      </div>
    </>
  )
}

export default Login