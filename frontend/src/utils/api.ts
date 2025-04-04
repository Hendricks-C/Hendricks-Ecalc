import supabase from "../utils/supabase";

const currentBadges = async (userId: string): Promise<number[]> => {
  // First fetch the badges IDs from user_badges for this user
  const { data: userBadgesData, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  if (userBadgesError) {
    console.error("Error fetching user badges:", userBadgesError.message);
    return[];
  }

  if (!userBadgesData || userBadgesData.length === 0) {
    return[]; // No badges found
  }

  return userBadgesData.map(badge => badge.badge_id);
}

export default currentBadges;