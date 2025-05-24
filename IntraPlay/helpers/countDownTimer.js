// React and library imports
import { useState, useEffect } from "react";
import { Text } from "react-native";
import { parse } from "date-fns";

// CountdownTimer component for displaying time until an event
const CountdownTimer = ({ eventDate, endTime }) => {
  // State for remaining time display
  const [timeRemaining, setTimeRemaining] = useState("Loading...");

  // Function to convert date and time strings to Date object
  const convertToDateTime = (dateStr, timeStr) => {
    try {
      // Parse time string
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) throw new Error(`Invalid time format: ${timeStr}`);
      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

      // Parse date string
      const dateObj = parse(dateStr, "EEEE, MMMM d, yyyy", new Date());
      if (isNaN(dateObj.getTime())) throw new Error(`Invalid date: ${dateStr}`);

      // Set hours and minutes
      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj;
    } catch (error) {
      console.warn(`Error parsing date/time: ${dateStr} ${timeStr}`, error);
      return null;
    }
  };

  // Update countdown timer
  useEffect(() => {
    // Convert event date and time
    const endDate = convertToDateTime(eventDate, endTime);

    // Handle invalid date/time
    if (!endDate) {
      setTimeRemaining("Invalid time");
      return;
    }

    // Function to calculate and update remaining time
    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = endDate - now;

      // Handle expired timer
      if (timeDiff <= 0) {
        setTimeRemaining("Match Ended");
        clearInterval(intervalId);
      } else {
        // Calculate hours, minutes, seconds
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Update display
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    // Initial update
    updateCountdown();
    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [eventDate, endTime]);

  // Render countdown text
  return (
    <Text style={{ color: "#111827", fontSize: 14 }}>{timeRemaining}</Text>
  );
};

// Export component for use in other files
export default CountdownTimer;
