import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'

function Navbar() {
    const navigate = useNavigate()
    const handleClick = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error logging out:', error.message)
            return
        }
        navigate('/login')
    }
    return (
        <nav className="flex justify-between items-center flex-row rounded-lg border border-gray-300 bg-white p-4 m-4">
                <div className="flex items-center">
                    <Link to="/" className='text-lg'>Hendricks Foundation</Link>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Link to="/about" className='no-underline hover:underline'>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline'>Contact</Link>
                    <Link to="/login" className='no-underline hover:underline'>Login</Link>
                    <Link to="/register" className='no-underline hover:underline'>Register</Link>
                    <button onClick={handleClick} className="border p-1 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600">Sign Out</button>
                </div>
        </nav>
    )  
}

export default Navbar