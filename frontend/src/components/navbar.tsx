/*
    Note: modify the line "setIsAdmin(sessionUser.email?.endsWith('@hendricks-foundation.org') || false);" to change which email domains are considered admin. Only admins can see the admin page.
*/
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'
import { useEffect, useState } from 'react';
import HendricksLogo from '../assets/hendricksLogo.png'

import { Profile } from '../utils/types';
import { useLocation } from 'react-router-dom';

import { Menu, X } from 'lucide-react';


/**
 * Navbar Component
 * 
 * Displays a responsive navigation bar with authentication-aware links.
 * Admins (based on email domain) see the "Admin" link.
 * Uses Supabase to track and verify authenticated users and 2FA status.
 */
function Navbar() {
    const location = useLocation();
    const navigate = useNavigate()

    // User session state
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    // Mobile menu toggle
    const [isOpen, setOpen] = useState(false);

    /**
     * Check for a valid Supabase session and pull user data.
     * If valid and 2FA verified, store user in state.
     */
    useEffect(() => {
        async function checkUser() {
            // Fetch session user from Supabase
            const { data, error } = await supabase.auth.getUser();
            
            // Assigning user data so it can be used to get the user.id
            const sessionUser = data?.user;

            // Error handling incase was not able to get the user.
            if (error || !sessionUser) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            // Get full user profile from Supabase DB
            const { data: rawData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

            if (userError || !rawData) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            const userData = rawData as Profile;

            // Prevent login if user hasn’t passed 2FA
            if (!userData.two_fa_verified) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            // User is valid and verified — update state
            setUser(sessionUser);

            // Change domain logic here for different admin scopes
            setIsAdmin(sessionUser.email?.endsWith('@hendricks-foundation.org') || false);
        }

        // Trigger checkUser on auth state change or path change
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (session?.user) {
                checkUser();
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

        //Cleans up the listener when the component unmounts.
        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [location.pathname]);

    /**
     * Collapse mobile menu on window resize if over breakpoint
     */
    useEffect( () => {
        function handleResize() {
            if (window.innerWidth >= 1020){
                setOpen(false);
            }
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        
        //Cleans up the listener when the component unmounts.
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    /**
     * Sign out the user and reset 2FA flag.
     */
    const handleClick = async () => {
        // Update the 2FA verified in the profiles table to false
        const { error: updateError } = await supabase
        .from("profiles")
        .update({ two_fa_verified: false })
        .eq("id", user.id);
    
        // Error handling incase update fails
        if (updateError) {
            console.error("Error updating profile for 2FA:", updateError);
            return;
        }
        
        // Then sign out using Supabase signOut()
        const { error } = await supabase.auth.signOut()
        
        if (error) { // Error handling incase logout fails
            console.error('Error logging out:', error.message)
            return
        }

        setUser(null);
        navigate('/login')
    }
    return (
        // z-50 is to ensure navbar stays above all other content
        <nav className="z-50 px-10 py-4 m-4 bg-white shadow-md rounded-[2.25rem] transition-all duration-300">

            {/* Desktop Navbar */}
            <div className='hidden relative lg:flex justify-between items-center'>
                <div className="flex items-center">
                    <img src={HendricksLogo} alt="Hendricks Foundation Logo" className="w-10 h-10 rounded-full mr-4" />
                    <Link to="/" className='text-sm sm:text-lg no-underline'>HENDRICKS FOUNDATION</Link>
                </div>
                <div className="flex gap-2 sm:gap-10 text-black font-bitter text-sm sm:text-lg z-50">
                    <Link to="/" className='no-underline hover:underline'>Home</Link>
                    <Link to="/about" className='no-underline hover:underline'>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline'>Contact</Link>
                    {!user ? (
                        <>
                            <Link to="/login" className="no-underline hover:underline">Login</Link>
                            <Link to="/register" className="no-underline hover:underline">Register</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/device-info-submission" className="no-underline hover:underline">Devices</Link>
                            <Link to="/profile" className="no-underline hover:underline">Profile</Link>
                            {isAdmin ? <Link to="/admin" className="no-underline hover:underline">Admin</Link> : null}
                            <button onClick={handleClick} className='text-sm bg-[#FFE017] px-4 py-1 rounded-md text-white transition duration-200 cursor-pointer hover:brightness-105'>Sign Out</button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className='flex lg:hidden relative justify-between items-center'>
                <div className="flex items-center">
                    <img src={HendricksLogo} alt="Hendricks Foundation Logo" className="w-10 h-10 rounded-full mr-4" />
                    <Link to="/" className='text-sm sm:text-lg no-underline'>HENDRICKS FOUNDATION</Link>
                </div>
                {isOpen ? <X className='block lg:hidden h-[30px] w-[30px]' onClick={() => setOpen(!isOpen)}/> : <Menu className='block lg:hidden h-[30px] w-[30px]' onClick={() => setOpen(!isOpen)}/>}
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`transition-all duration-400 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col justify-center items-center mt-4 gap-4 sm:gap-10 text-black font-bitter text-sm sm:text-lg">
                    <Link to="/" className='no-underline hover:underline' onClick={() => setOpen(!isOpen)}>Home</Link>
                    <Link to="/about" className='no-underline hover:underline' onClick={() => setOpen(!isOpen)}>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline' onClick={() => setOpen(!isOpen)}>Contact</Link>
                    {!user ? (
                        <>
                            <Link to="/login" className="no-underline hover:underline" onClick={() => setOpen(!isOpen)}>Login</Link>
                            <Link to="/register" className="no-underline hover:underline" onClick={() => setOpen(!isOpen)}>Register</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/device-info-submission" className="no-underline hover:underline" onClick={() => setOpen(!isOpen)}>Devices</Link>
                            <Link to="/profile" className="no-underline hover:underline" onClick={() => setOpen(!isOpen)}>Profile</Link>
                            {isAdmin ? <Link to="/admin" className="no-underline hover:underline" onClick={() => setOpen(!isOpen)}>Admin</Link> : null}
                            <button onClick={handleClick} className='bg-[#FFE017] px-4 py-2 rounded-md text-white transition duration-200 cursor-pointer hover:brightness-105'>Sign Out</button>
                        </>
                    )}
                </div>
            </div>
            
            
        </nav>
    )
}

export default Navbar