import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [currentEmail, setEmail] = useState<String>();
  const [newEmail, setNewEmail] = useState<String>();

  const [currentPassword, setPassword] = useState<String>();
  const [newPassword, setNewPassword] = useState<String>();

  const getUserData = async () => {
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

  return (
    <>
      <p>{currentEmail}</p>
    </>
  );
};

export default UserProfile;
