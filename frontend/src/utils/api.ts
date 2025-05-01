import supabase from "../utils/supabase";
import axios from "axios"

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Fetches all badge IDs that a user currently has from the 'user_badges' table.
 * 
 * @param userId - The ID of the user whose badges are being retrieved.
 * @returns A Promise that resolves to an array of badge IDs (number[]).
 */
const currentBadges = async (userId: string): Promise<number[]> => {
  
  // First fetch the badges IDs from user_badges for this user
  const { data: userBadgesData, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  // Handle any errors during the query
  if (userBadgesError) {
    console.error("Error fetching user badges:", userBadgesError.message);
    return[];
  }

  // If user has no badges, return an empty array
  if (!userBadgesData || userBadgesData.length === 0) {
    return[];
  }

  // Extract just the badge_id values into a plain array
  return userBadgesData.map(badge => badge.badge_id);
}

/**
 * Checks how long the user has been a member based on their account creation date.
 * If eligible, awards them a time-based badge (e.g., 1 month, 2 months).
 * 
 * @param id - User ID.
 * @param whenCreated - ISO date string representing when the user was created.
 * @returns A congratulatory message string if a badge was earned, or undefined.
 */
const checkHowLongMember = async (id:string, whenCreated:string) => {

  // Extract badge IDs
  const badgeIds = await currentBadges(id);

  // Parse creation date and get current date
  const givenDate = new Date(whenCreated);
  const currentDate = new Date();

  // Calculate how many months and years have passed
  const differenceInMonths = (currentDate.getMonth() + 1) - (givenDate.getMonth() + 1);
  const differenceInYear = (currentDate.getFullYear()) - (givenDate.getFullYear());

  let gotBadge = "";


  // Case 1: User has been a member for at least 1 month, but less than 2
  if (differenceInMonths >= 1 && differenceInYear == 0 && !badgeIds.includes(5)){
    const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: id, badge_id: 5 });

    if (error) {
        console.error("Error inserting badge for user:", error.message);
        return;
    } else {
        gotBadge = "Happy 1 month on the site! You just unlocked the 1 month badge";
    }

  // Case 2: User has been a member for at least 2 months
  } else if (differenceInMonths >= 2 && differenceInYear == 0 && !badgeIds.includes(6)){
    const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: id, badge_id: 6 });

    if (error) {
        console.error("Error inserting badge for user:", error.message);
        return;
    } else {
        gotBadge = "Happy 2 months on the site! You just unlocked the 2 months badge";
    }
  }

  return gotBadge;
}

/**
 * Sends a base64-encoded image and manufacturer name to the backend API,
 * which uses OCR to extract and return any detected text.
 * 
 * @param imageBase64 - The image content in base64 encoding.
 * @param manufacture - The manufacturer name used for tailored OCR parsing.
 * @returns Extracted text as a string, or an error message if OCR fails.
 */
const ExtractTextFromImage = async (imageBase64: string, manufacture:string ) => {
  try {
    // Make a POST request to the backend OCR endpoint with image and manufacturer
    const response = await axios.post(`${apiBase}/api/image-processing/ocr`, {
      imageBase64,
      manufacture
    });

    // Return the extracted text from the response
    return response.data.text;
  } catch (error) {
    console.error("Error fetching OCR results:", error);
    return "OCR failed";
  }
};

export {currentBadges, checkHowLongMember, ExtractTextFromImage};