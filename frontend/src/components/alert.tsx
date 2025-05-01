import { useState, useEffect } from "react";

/**
 * @typedef Alerts
 * @property {string} text - The message to be displayed in the alert.
 * @property {boolean} show - Controls visibility of the alert (trigger to show).
 */
interface Alerts {
  text: string;
  show: boolean;
}

/**
 * Alert Component
 * 
 * Displays a temporary, dismissible alert at the top-right of the screen.
 * Fades in when `show` becomes true and automatically disappears after 3 seconds.
 * 
 * @param text - The alert message to show
 * @param show - A boolean flag to trigger the alert
 */
const Alert = ({ text, show}: Alerts) => {
  
  // Controls the opacity
  const [isVisible, setVisible] = useState(false);

  // Controls mounting/unmounting
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (show){
      // Trigger mount and fade-in
      setRender(true);
      setVisible(true);

      // Automatically fade out after 3 seconds
      setTimeout(() => setVisible(false), 3000);
    }
  }, [show]);

  return (
    <div>
      {
        render && 
        <div 
          className={`fixed top-28 right-4 z-50 flex items-center p-4 border-t-4 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 shadow-lg rounded-md transition-opacity duration-300 ease-in-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`} role="alert"
        >

          {/* Alert Text */}
          <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
            <p>{text}</p>
          </div>

           {/* Dismiss Button */}
          <button
            onClick={() => setVisible(false)}
            className="ms-auto -mx-1.5 -my-1.5 bg-gray-50 text-gray-500 rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Close"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      }
    </div>
  );
};

export default Alert;
