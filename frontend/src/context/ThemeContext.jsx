import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
      const [theme, setTheme] = useState(() => {
            return localStorage.getItem("theme") || "dark";
      });

      useEffect(() => {
            const root = document.documentElement;
            if (theme === "light") {
                  root.classList.remove("dark");
                  root.classList.add("light");
            } else {
                  root.classList.remove("light");
                  root.classList.add("dark");
            }
            localStorage.setItem("theme", theme);
      }, [theme]);

      const toggleTheme = () => {
            setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      };

      return (
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                  {children}
            </ThemeContext.Provider>
      );
};

export const useTheme = () => useContext(ThemeContext);
