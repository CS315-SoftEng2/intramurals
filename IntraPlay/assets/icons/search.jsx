import React from "react";
import Svg, { Circle, Line } from "react-native-svg";

const SearchIcon = ({ color = "#A0A4AE", size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
    <Circle cx="220" cy="220" r="140" stroke={color} strokeWidth="40" />
    <Line
      x1="340"
      y1="340"
      x2="480"
      y2="480"
      stroke={color}
      strokeWidth="40"
      strokeLinecap="round"
    />
  </Svg>
);

export default SearchIcon;
