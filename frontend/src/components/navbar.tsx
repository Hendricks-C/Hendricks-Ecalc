import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="flex justify-between items-center flex-row rounded-lg border border-gray-300 bg-white p-4 m-4">
                <div className="flex">
                    <Link to="/" className='text-lg'>Hendricks Foundation</Link>
                </div>
                <div className="flex flex-row gap-4">
                    <Link to="/about" className='no-underline hover:underline'>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline'>Contact</Link>
                    <Link to="/login" className='no-underline hover:underline'>Login</Link>
                    <Link to="/register" className='no-underline hover:underline'>Register</Link>
                </div>
        </nav>
    )  
}

export default Navbar