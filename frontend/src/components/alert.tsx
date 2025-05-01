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
      {render && (
        <div
          className={`fixed top-28 right-4 z-50 flex items-center p-4 border-l-4 border-[#2E7D32] bg-[#F4FFF7] shadow-lg rounded-md transition-opacity duration-300 ease-in-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          role="alert"
        >
          {/* Alert Text */}
          <div className="text-sm font-medium text-[#2E7D32] font-bitter">
            <p>{text}</p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setVisible(false)}
            className="ms-auto -mx-1.5 -my-1.5 bg-transparent text-[#2E7D32] rounded-lg focus:ring-2 focus:ring-[#A8D5BA] p-1.5 hover:bg-[#E0F2E9] inline-flex items-center justify-center h-8 w-8"
            aria-label="Close"
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Alert;
