import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const TeamIcon = ({ color = "#666", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="8" r="4.5" stroke={color} strokeWidth="2.5" />
    <Path
      d="M4 20C4 16.5 7 14 10 14C13 14 16 16.5 16 20"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    <Circle cx="18" cy="10" r="3" stroke={color} strokeWidth="2.5" />
    <Path
      d="M15.5 20C15.5 18 16.5 16 18.5 16C20.5 16 21.5 18 21.5 20"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export default TeamIcon;
