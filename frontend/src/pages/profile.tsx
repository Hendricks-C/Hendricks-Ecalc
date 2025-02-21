import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [currentEmail, setEmail] = useState<String>();
  const [newEmail, setNewEmail] = useState<String>();

  const [currentPassword, setPassword] = useState<String>();
  const [newPassword, setNewPassword] = useState<String>();
  const [confirmPassword, setConfirmPassword] = useState<String>();

  const [passLenErrorCurr, setPassLenErrorCurr] = useState(false);
  const [passLenErrorNew, setPassLenErrorNew] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (currentPassword && currentPassword.length >= 8) {
      setPassLenErrorCurr(false);
    } else {
      setPassLenErrorCurr(true);
    }

    if (newPassword && newPassword.length >= 8) {
      setPassLenErrorCurr(false);
    } else {
      setPassLenErrorCurr(true);
    }

    if (newPassword === confirmPassword) {
      setPasswordConfirmError(false);
    } else {
      setPasswordConfirmError(true);
    }

    

    
  }
  
  const getUserData = async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!session) {
          navigate("/login");
        } else {
          getUserData();
        }
      }
    );
    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

    // Handle password change for dynamic validation
    const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      setPassword(password);
  
      // Check password length on each change
      if (password.length >= 8) {
        setPassLenErrorCurr(false);
      } else {
        setPassLenErrorCurr(true);
      }
    };
  
    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      setNewPassword(password);
  
      // Check password length on each change
      if (password.length >= 8) {
        setPassLenErrorNew(false);
      } else {
        setPassLenErrorNew(true);
      }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const password = e.target.value;
      setConfirmPassword(password);
  
      // Check password to see if its the same as new
      if (newPassword === password) {
        setPasswordConfirmError(false);
      } else {
        setPasswordConfirmError(true);
      }
    };

  return (
<div className='flex flex-row justify-evenly items-center'>
        <div className="flex flex-col items-center">
            <div className="p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100">
                <h1 className="text-center mb-10 font-black text-lg">Change Password</h1>
                <form onSubmit={changePassword} className="flex flex-col gap-4">
                    <div>
                        <label>Current Password</label>
                        <input
                        type="password"
                        placeholder="**********"
                        onChange={handleCurrentPasswordChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                        {passLenErrorCurr && <p className="text-red-400">Password must be at least 8 characters.</p>}
                    </div>
                    <div>
                        <label>New password</label>
                        <input
                        type="password"
                        placeholder="**********"
                        onChange={handleNewPasswordChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                        {passLenErrorNew && <p className="text-red-400">Password must be at least 8 characters.</p>}
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input
                        type="password"
                        placeholder="**********"
                        onChange={handleConfirmPasswordChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                        />
                        {passwordConfirmError && <p className="text-red-400">Passwords do not match</p>}
                    </div>
                    <div className="flex flex-col justify-center gap-2 items-center">
                        <button className="border p-1 w-1/2 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Change Password</button>
                    </div>
                </form>
                
            </div>
        </div>
      </div>
  );
};

export default UserProfile;
