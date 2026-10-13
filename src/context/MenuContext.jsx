"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [counter, setCounter] = useState(0);

  // 450ms debounce: only update debouncedSearch when the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Immediately commit search (e.g. on Enter key press or clear)
  const commitSearchImmediately = (value) => {
    setSearchQuery(value);
    setDebouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Status indicating that the user is currently typing and the 450ms debounce window is active
  const isDebouncing = searchQuery !== debouncedSearch;

  const incrementCounter = () => setCounter((prev) => prev + 1);
  const decrementCounter = () => setCounter((prev) => Math.max(0, prev - 1));
  const resetCounter = () => setCounter(0);

  return (
    <MenuContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        commitSearchImmediately,
        isDebouncing,
        clearSearch,
        counter,
        setCounter,
        incrementCounter,
        decrementCounter,
        resetCounter,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
