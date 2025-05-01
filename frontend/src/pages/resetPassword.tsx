import { useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../utils/supabase';

import Alert from '../components/alert.tsx';
import { useAlert } from '../hooks/useAlert.tsx';

/**
 * Handles the password reset flow after a user clicks the link sent to their email.
 * Validates session type, handles password update with Supabase,
 * and provides user feedback and redirects.
 */
function ForgotPassword() {
    
    // Local state for input and validation
    const [password, setPassword] = useState<string>('')
    const [confirm, setConfirm] = useState<string>('')
    const [validSession, setValidSession] = useState<boolean>(false)
    const [loading, setLoading] = useState(false);
    // const [visibility, setVisibility] = useState<boolean>(false)

    const { alertText, showAlert, triggerAlert } = useAlert();

    const navigate = useNavigate()

    /**
     * useEffect runs once on mount.
     * Listens for auth state changes to confirm it's a password recovery session.
     * If not, redirects to homepage for safety.
     */
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
    
            // Check if the session exists and is a password recovery session
            if (session?.user) {
                setValidSession(true);
            } else {
                navigate('/');
            }
        };
    
        checkSession();
    
        // Still listen to future auth events as a backup
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session?.user) {
                setValidSession(true);
            }
        });
    
        return () => {
            authListener.subscription?.unsubscribe();
        };
    }, []);

    /**
     * Handles the password reset form submission using Supabase updateUser()
     * Validates form inputs, ensures session is valid, updates password, and gives feedback.
     * 
     * @param event - Form submit event
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setLoading(true);
        if (!validSession) { // Check if session is valid
            setLoading(false);
            triggerAlert('Invalid session. Please request a new password reset email.')
            return
        } 
        else if (password !== confirm) { // Check if passwords match
            setLoading(false);
            triggerAlert('Passwords do not match.')
            return
        } 
        else { // reset password if all checks pass
            
            //call update user function from supabase
            const { data:_userResponse, error } = await supabase.auth.updateUser({
                password: password
            })

            // Error handling
            if (error) { 
                setLoading(false);
                console.error('Error updating password:', error.message)
                triggerAlert(error.message)
                return
            }

            // Success message
            setLoading(false);
            triggerAlert('Password reset successful. Redirecting you to login.')
            setValidSession(false)
            navigate('/login')
        }
    }

    return (
        <>
            <Alert text={alertText} show={showAlert}/>
            <div className="flex items-center justify-evenly px-4 py-8 md:px-10 md:py-10">
                <div className="w-full max-w-xl flex flex-col items-center mt-5 sm:px-5 md:px-6">

                    {/* Title Section */}
                    <div className="mb-4 text-center">
                        <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
                        Reset Password
                        </h1>
                        <h2 className="text-white text-sm sm:text-xl font-medium font-bitter mt-1">
                        Enter a new password below
                        </h2>
                    </div>

                    {/* Form Container */}
                    <div className="w-full bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        
                            {/* New Password */}
                            <div className="flex flex-col">
                                <label className="text-black font-bitter font-medium text-lg mb-1">New Password:</label>
                                <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col">
                                <label className="text-black font-bitter font-medium text-lg mb-1">Confirm Password:</label>
                                <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col justify-center gap-2 items-center mt-3">
                                <button
                                type="submit"
                                className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 hover:brightness-105"
                                >
                                    {loading ? "Loading..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;