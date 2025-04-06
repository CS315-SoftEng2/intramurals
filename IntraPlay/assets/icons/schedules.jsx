import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const ScheduleIcon = ({ color = "#666", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H21V20H3V6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />

    <Circle cx="17" cy="16" r="4" stroke={color} strokeWidth="2" />
    <Path d="M17 14V16L18.5 17.5" stroke={color} strokeWidth="2" />
  </Svg>
);

export default ScheduleIcon;
