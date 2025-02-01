import { useState } from 'react';
import supabase from '../utils/supabase';

function ResetPassword() {
    const [email, setEmail] = useState<string>('')
    // const [visibility, setVisibility] = useState<boolean>(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://example.com/update-password',
        })

        if (error) {
            console.error(error.message)
            alert(error.message)
            return
        }
        
        console.log('Password reset email sent')
        alert('Password reset email sent')
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex">Email:</label>
                <input
                type="text"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                />
                <button className="border w-1/2 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Send Reset Instructions</button>
            </form>
        </div>
    );
}

export default ResetPassword;