import React from "react";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

/**
 * Hook to warm up the WebBrowser for better performance
 * This should be called in components that will use WebBrowser
 * It pre-initializes the browser to reduce latency when opening links
 */
export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync();
    }
    return () => {
      if (Platform.OS !== "web") {
        void WebBrowser.coolDownAsync();
      }
    };
  }, []);
};
