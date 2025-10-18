import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"saveslot" | "saveslotlight">(() => {
    const stored = localStorage.getItem("theme") as
      | "saveslot"
      | "saveslotlight"
      | null;

    if (stored === "saveslot" || stored === "saveslotlight") {
      return stored;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "saveslot" : "saveslotlight";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "saveslot" ? "saveslotlight" : "saveslot"));
  };

  return (
    <button onClick={toggleTheme} className="">
      <span className="cursor-pointer hover:text-primary transition-colors">
        {theme === "saveslot" ? (
          <Moon className="w-5" />
        ) : (
          <Sun className="w-5" />
        )}
      </span>
    </button>
  );
}
