import { useState, useEffect } from "react";
import { Text } from "react-native";
import { parse } from "date-fns";

const CountdownTimer = ({ eventDate, endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState("Loading...");

  const convertToDateTime = (dateStr, timeStr) => {
    try {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) throw new Error(`Invalid time format: ${timeStr}`);
      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

      const dateObj = parse(dateStr, "EEEE, MMMM d, yyyy", new Date());
      if (isNaN(dateObj.getTime())) throw new Error(`Invalid date: ${dateStr}`);

      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj;
    } catch (error) {
      console.warn(`Error parsing date/time: ${dateStr} ${timeStr}`, error);
      return null;
    }
  };

  useEffect(() => {
    const endDate = convertToDateTime(eventDate, endTime);

    if (!endDate) {
      setTimeRemaining("Invalid time");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = endDate - now;

      if (timeDiff <= 0) {
        setTimeRemaining("Match Ended");
        clearInterval(intervalId);
      } else {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [eventDate, endTime]);

  return <Text style={{ color: "#fff", fontSize: 14 }}>{timeRemaining}</Text>;
};

export default CountdownTimer;
