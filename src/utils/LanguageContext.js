import { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("th");

  // Load persisted language preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang");
      if (saved === "th" || saved === "en") {
        setLang(saved);
      }
    }
  }, []);

  const toggleLang = () => {
    const next = lang === "th" ? "en" : "th";
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", next);
    }
  };

  // Translate helper — supports both plain strings and function templates
  const t = (key, ...args) => {
    const value = translations[lang]?.[key] ?? translations["th"]?.[key] ?? key;
    if (typeof value === "function") return value(...args);
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
