import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme-mode");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      return savedTheme;
    }
  }
  return "light";
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.mode === "light" ? "dark" : "light";
      state.mode = nextTheme;
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme-mode", nextTheme);
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute("data-theme", action.payload);
        localStorage.setItem("theme-mode", action.payload);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
