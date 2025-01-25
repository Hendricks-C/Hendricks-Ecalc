import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginBox() {
    const [email, setEmail] = useState('')
    const [company, setCompany] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
    }

    return (
        <div className="flex flex-col items-center">
            <h1>Information</h1>
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
                    <div className="flex flex-col justify-center">
                        <button className="border items-center rounded-md" type="submit">Login</button>
                        <button className="border items-center rounded-md" type="button">Skip</button>
                    </div>
                    <div>
                        <p>Don't have an account? <Link to="/register" className='no-underline hover:underline'>Create one now.</Link></p>
                    </div>
                </form>
                
            </div>
        </div>
    )
}

export default LoginBox