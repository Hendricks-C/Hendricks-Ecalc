import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'
import { useEffect, useState } from 'react';
import HendricksLogo from '../assets/hendricksLogo.png'

function Navbar() {

    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

    // Check for existing user session
    useEffect(() => {

        async function checkUser() {
            const { data, error } = await supabase.auth.getUser();
            if (!error) {
                setUser(data?.user || null);
            }

            // Check if the user is an admin based on their email domain
            setIsAdmin(data?.user?.email?.endsWith('@gmail.com') || false);
        }

        checkUser();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user || null);
            setIsAdmin(session?.user?.email?.endsWith('@gmail.com') || false);
        });

        //Cleans up the listener when the component unmounts.
        return () => authListener.subscription.unsubscribe();
    }, []);

    // handle signout button
    const handleClick = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) { // Error handling
            console.error('Error logging out:', error.message)
            return
        }
        setUser(null);
        navigate('/login')
    }
    return (
        <nav className="flex justify-between items-center px-10 py-4 m-4 bg-white rounded-full shadow-md">
            <div className="flex items-center">
                <img src={HendricksLogo} alt="Hendricks Foundation Logo" className="w-10 h-10 rounded-full mr-4"/>
                <Link to="/" className='text-lg no-underline'>HENDRICKS FOUNDATION</Link>
            </div>
            <div className="flex gap-10 text-black font-bitter text-lg">
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
        </nav>
    )
}

export default Navbar