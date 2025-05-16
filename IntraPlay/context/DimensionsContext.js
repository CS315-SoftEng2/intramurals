// React and library imports
import React, { createContext, useContext, useEffect, useState } from "react";
import { Dimensions } from "react-native";

// Create dimensions context
const DimensionsContext = createContext();

// DimensionsProvider component for managing screen dimensions
export const DimensionsProvider = ({ children }) => {
  // State for screen dimensions
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  // Update dimensions on window size change
  useEffect(() => {
    // Subscribe to dimensions change event
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    // Clean up subscription on unmount
    return () => subscription?.remove?.();
  }, []);

  // Provide dimensions to child components
  return (
    <DimensionsContext.Provider value={dimensions}>
      {children}
    </DimensionsContext.Provider>
  );
};

// Hook to access dimensions context
export const useDimensions = () => useContext(DimensionsContext);
