import {create} from 'zustand'

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("talkslyy-theme") || "forest",
    setTheme: (theme) => {
        localStorage.setItem("talkslyy-theme", theme);
        set({theme})
    },
}))
