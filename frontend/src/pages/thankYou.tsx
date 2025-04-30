import { Link, useNavigate } from 'react-router-dom'
import Laptop from '../assets/laptop.png'

import { useEffect } from 'react'
import supabase from '../utils/supabase.ts'
import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'

function ThankYou() {

    const navigate = useNavigate() //used to redirect to different page

    //checking for existing user session
    useEffect(() => {

        // Checks if user has a profile and 2FA is verified
        async function checkUser(user: User) {
            const { data: rawData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError || !rawData) {
                console.error("Profile lookup failed", userError);
                navigate("/login"); // Redirect if user data cannot be fetched
                return;
            }

            const userData = rawData as Profile;

            // Redirect user to login if 2FA has not been verified
            if (userData.two_fa_verified === false) {
                navigate("/login");
            }
        }

        // Listen to changes in authentication state
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (session) {
                checkUser(session.user); // Call checkUser if session exists
            }
        });

        return () => authListener.subscription.unsubscribe(); // Cleanup listener on component unmount
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center">

            {/* Title message */}
            <h1 className="text-white text-2xl sm:text-5xl md:text-7xl font-bold font-bitter leading-large tracking-widest capitalize drop-shadow-md mt-20">
                Thank you!
            </h1>

            {/* Image */}
            <img src={Laptop} alt="Laptop" className="w-[50%] h-auto" />

            {/* Return to homepage button */}
            <Link to="/">
                <button className="bg-[#FFE017] cursor-pointer text-white font-bold text-xl md:text-xl px-10 md:px-20 py-2 rounded-full shadow-md hover:brightness-105 transition mb-5 md:mb-10">
                    HOME
                </button>
            </Link>
        </div>
    );
}

export default ThankYou;