import { useState } from 'react';
import supabase from '../utils/supabase';

/**
 * ForgotPassword Component (Request Reset Email)
 *
 * This component allows users to input their email to receive a password reset link.
 * The link redirects them to a secure frontend route to complete the password reset process.
 */
function ForgotPassword() {
    // Form state
    const [email, setEmail] = useState<string>('')
    const [loading, setLoading] = useState(false);

    // Fallback frontend redirect URL
    const frontendURL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    /**
     * Handles form submission and triggers password reset email via Supabase.
     * 
     * @param event - Form event from the submit action.
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setLoading(true);
        
        // Trigger Supabase password reset email
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${frontendURL}/reset-password`,
        })

        // Error handling
        if (error) {
            setLoading(false);
            console.error(error.message)
            alert(error.message)
            return
        }

        // Success message
        if (data) {
            setLoading(false);
            alert('Password reset email sent. You may close this tab.')
        }
    }

    return (
        <div className="flex items-center justify-evenly px-4 py-8 md:px-10 md:py-10">
            <div className="w-full max-w-xl flex flex-col items-center mt-5 sm:px-5 md:px-6">
                {/* Title Section */}
                <div className="mb-4 text-center">
                    <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
                    Reset Password
                    </h1>
                    <h2 className="text-white text-sm sm:text-xl font-medium font-bitter mt-1">
                    Enter your email to get a reset link
                    </h2>
                </div>

                {/* Form Container */}
                <div className="w-full bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                    <div className="flex flex-col justify-center gap-2 items-center mt-3">
                        <button
                        type="submit"
                        className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 hover:brightness-105"
                        >
                            {loading ? "Sending..." : "Send Reset Instructions"}
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;