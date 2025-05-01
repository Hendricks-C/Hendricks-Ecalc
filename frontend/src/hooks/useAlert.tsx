import { useState } from 'react';

/**
 * Custom hook for managing alert state and auto-dismissal.
 *
 * @param timeout - Duration (in ms) before the alert disappears automatically (default: 3000ms).
 * @returns An object containing:
 *  - alertText: The message to display in the alert.
 *  - showAlert: A boolean to control visibility of the alert.
 *  - triggerAlert: A function to show the alert with a given message.
 */
export function useAlert(timeout = 3000) {
  // Holds the text content of the alert
  const [alertText, setAlertText] = useState('');

  // Controls whether the alert is visible or not
  const [showAlert, setShowAlert] = useState(false);

  /**
   * Triggers the alert by setting the message and showing it.
   * Automatically hides the alert after the specified timeout.
   *
   * @param message - The message to display in the alert
   */
  const triggerAlert = (message: string) => {
    setAlertText(message);     // Set the alert content
    setShowAlert(true);        // Make it visible
    setTimeout(() => {
      setShowAlert(false);     // Hide it after `timeout` ms
    }, timeout);
  };

  // Return the state and trigger function for use in components
  return { alertText, showAlert, triggerAlert };
}