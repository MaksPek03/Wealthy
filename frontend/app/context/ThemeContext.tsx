import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => {},
});

// @ts-ignore
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
