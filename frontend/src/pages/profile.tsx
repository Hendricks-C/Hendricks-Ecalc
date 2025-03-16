import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { AuthResponse } from '@supabase/supabase-js'
import { useNavigate } from "react-router-dom";

import Alert from "../components/alert"

interface Badge {
    id: number;
    name: string;
}

const UserProfile = () => {

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        company: "",
    });


    const [editingProfile, setEditingProfile] = useState(false); // Toggle profile edit mode
    const [editingEmail, setEditingEmail] = useState(false); // Toggle email edit mode
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailUpdateMessage, setEmailUpdateMessage] = useState("");


    const [currentPassword, setPassword] = useState<string>();
    const [newPassword, setNewPassword] = useState<string>();
    const [confirmPassword, setConfirmPassword] = useState<string>();

    const [passLenErrorCurr, setPassLenErrorCurr] = useState(false);
    const [passLenErrorNew, setPassLenErrorNew] = useState(false);
    const [passwordConfirmError, setPasswordConfirmError] = useState(false);
    const [wrongPassword, setWrongPasswordError] = useState(false);

    const [badges, setBadges] = useState<Badge[]>([]);

    /**
     * @returns Uses the signInWithPassword to check if the current password the user inputs is the one tied to the 
     * account. Then will update the password accordingly.
     */
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

        const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({
            email: email,
            password: currentPassword,
        })

        // error handling
        if (error) {
            setWrongPasswordError(true);
            return;
        }

        // Update password in Supabase
        const { user, error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            alert(updateError.message);
            return;
        }

        alert('Password updated successfully!');

    }

    const navigate = useNavigate();

    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/login");
            }
            else {
                async function fetchUserAndProfile() {
                    const { data: authData, error: authError } = await supabase.auth.getUser();
                    if (authError || !authData?.user) {
                        console.error("Error fetching user:", authError?.message);
                        return;
                    }

                    const userId = authData.user.id;
                    setUser(authData.user);
                    setEmail(authData.user.email || "");

                    // Fetch profile details from Supabase
                    const { data: profileData, error: profileError } = await supabase
                        .from("profiles")
                        .select("first_name, last_name, company, email")
                        .eq("id", userId)
                        .single();

                    if (profileError) {
                        console.error("Error fetching profile:", profileError.message);
                        return;
                    }

                    setProfile({
                        first_name: profileData.first_name || "",
                        last_name: profileData.last_name || "",
                        company: profileData.company || "",
                    });

                    fetchUserBadges(userId);
                }


                fetchUserAndProfile();
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);

    // Handle profile update (first name, last name, company)
    const handleProfileUpdate = async () => {
        if (!user) return;


        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
                company: profile.company.trim(),
            })
            .eq("id", user.id);


        if (error) {
            console.error("Profile update error:", error.message);
            alert("Failed to update profile.");
        } else {
            //alert("Profile updated successfully!");
            setEditingProfile(false); // Exit edit mode
        }
    };

    const handleEmailUpdate = async () => {
        if (!user || !newEmail.trim() || !confirmEmail.trim()) return;
        if (newEmail.trim() !== confirmEmail.trim()) {
            alert("Emails do not match.");
            return;
        }

        // Use updateUser() to change the email in auth.users
        //const{ error } = await supabase.auth.updateUser({email: newEmail.trim(),});

        const { error } = await supabase.auth.updateUser(
            {
                email: newEmail.trim(), // New email
            },
            {
                emailRedirectTo: "http://localhost:5173/login", // Redirect to login after confirmation
            }
        );

        if (error) {
            console.error("Email update error:", error.message);
            alert("Failed to update email: " + error.message);
        } else {
            setEmailUpdateMessage(
                "A confirmation email has been sent to your new email. Please verify it."
            );
            setEditingEmail(false);
        }
    };


    // Handle password changes for dynamic validation
    const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setPassword(password);

        if (password.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setNewPassword(password);

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

    // Fetch user badges
    const fetchUserBadges = async (userId: string) => {
        // First fetch the badges IDs from user_badges for this user
        const { data: userBadgesData, error: userBadgesError } = await supabase
            .from("user_badges")
            .select("badge_id")
            .eq("user_id", userId);

        if (userBadgesError) {
            console.error("Error fetching user badges:", userBadgesError.message);
            return;
        }

        if (!userBadgesData || userBadgesData.length === 0) {
            return; // No badges found
        }

        // Extract badge IDs
        const badgeIds = userBadgesData.map(badge => badge.badge_id);

        // Fetch badge details
        const { data: badgesData, error: badgesError } = await supabase
            .from("badges")
            .select("*")
            .in("id", badgeIds);

        if (badgesError) {
            console.error("Error fetching badge details:", badgesError.message);
            return;
        }

        setBadges(badgesData || []);
    };


    return (
        <div className='flex flex-row justify-evenly items-center'>
            <div className="flex flex-col w-1/3 p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100">
                <h1 className="text-2xl text-center mb-4 font-bold">Profile</h1>

                {/* User Profile Display */}
                {!editingProfile ? (
                    <>
                        <p><strong>Full Name:</strong> {profile.first_name} {profile.last_name}</p>
                        <p><strong>Company:</strong> {profile.company}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <button
                            className="border p-2 w-full mt-4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            onClick={() => setEditingProfile(true)}
                        >
                            Edit Profile
                        </button>
                    </>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="flex flex-col gap-4">
                        <div>
                            <label className="flex">First Name:</label>
                            <input
                                type="text"
                                value={profile.first_name}
                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Last Name:</label>
                            <input
                                type="text"
                                value={profile.last_name}
                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Company:</label>
                            <input
                                type="text"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="border p-2 w-full items-center rounded-md bg-gray-400 hover:bg-gray-300 cursor-pointer"
                                onClick={() => setEditingProfile(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            >
                                Save Changes
                            </button>

                        </div>
                    </form>
                )}


                <hr className="my-6" />


                {/* Email Section */}
                {!editingEmail ? (
                    <>
                        <p><strong>Current Email:</strong> {email}</p>
                        <button
                            className="border p-2 w-full mt-4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            onClick={() => setEditingEmail(true)}
                        >
                            Change Email
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4 mt-4">
                        {/* Non-editable current email field */}
                        <div>
                            <label className="flex">Current Email:</label>
                            <input
                                type="text"
                                value={email}
                                disabled
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="flex">New Email:</label>
                            <input
                                type="text"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Confirm New Email:</label>
                            <input
                                type="text"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        {/* Submit & Cancel Buttons */}
                        <div className="flex gap-4">
                            <button
                                className="border p-2 w-full items-center rounded-md bg-gray-400 hover:bg-gray-300 cursor-pointer"
                                onClick={() => setEditingEmail(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEmailUpdate}
                                className="border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            >
                                Submit Email Change
                            </button>
                        </div>
                    </div>
                )}

                <hr className="my-6" />


                {emailUpdateMessage && (
                    <p className="mt-4 text-green-600 text-sm text-center">{emailUpdateMessage}</p>
                )}


                {/* Password Reset Section */}
                <div >
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
                            {wrongPassword && <p className="text-red-400">Incorrect password</p>}
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

                <hr className="my-6" />

                {/* Badges Section */}
                <div>
                    <h1 className="text-2xl text-center mb-4 font-bold">Badges</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {badges.length > 0 ? (
                            badges.map((badge, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-md text-sm">
                                    {badge.name}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-500">No badges earned yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
