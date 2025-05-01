/**
 * @interface Profile
 * Represents a user profile object.
 * 
 * @property {string} id - Unique user identifier (usually from Supabase auth).
 * @property {string | null} email - User's email address.
 * @property {string | null} first_name - User's first name.
 * @property {string | null} last_name - User's last name.
 * @property {string | null} company - Company the user is affiliated with.
 * @property {boolean | null} two_fa_verified - Whether the user has completed 2FA verification.
 * @property {string | null} password - User's password (nullable; ideally not stored in plain text).
 * @property {string} created - Timestamp of when the user was created (ISO format).
 */
export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  two_fa_verified: boolean | null;
  password: string | null;
  created: string;
}


/**
 * @interface Badge
 * Represents a badge that can be awarded to users.
 * 
 * @property {number} id - Unique ID of the badge.
 * @property {string} name - Display name of the badge.
 */
export interface Badge {
  id: number;
  name: string;
}
