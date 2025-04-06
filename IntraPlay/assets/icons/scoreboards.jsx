import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const ScoreboardIcon = ({ color = "#666", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3C6 4.10457 6.89543 5 8 5H16C17.1046 5 18 4.10457 18 3V7C18 8.10457 17.1046 9 16 9H8C6.89543 9 6 8.10457 6 7V3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 5C4 6.10457 3.10457 7 2 7M22 5C22 6.10457 22.8954 7 24 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />

    <Rect x="7" y="15" width="10" height="2" stroke={color} strokeWidth="2" />

    <Rect x="8" y="17" width="8" height="2" fill={color} />
  </Svg>
);

export default ScoreboardIcon;
