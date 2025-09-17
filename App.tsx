import { useState, useEffect } from "react";
// Removed BrowserRouter as Router, Routes, Route imports
import HomePage from "./HomePage";
// PlacementsPage and AdminPage are now routed directly in main.tsx, so no longer needed here

export default function App() {
  // Check session storage to see if intro has been played
  const [showIntro, setShowIntro] = useState(sessionStorage.getItem('introSeen') !== 'true');
  const [currentLine, setCurrentLine] = useState(0);
  const [text, setText] = useState("");

  const lines = [
    "Initializing... Starting Computer Society of MIT",
    "Loading Innovation Modules..."
  ];

  // Typing animation for each line
  useEffect(() => {
    if (showIntro && currentLine < lines.length) {
      let i = 0;
      const interval = setInterval(() => {
        setText(lines[currentLine].slice(0, i));
        i++;
        if (i > lines[currentLine].length) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentLine((prev) => prev + 1);
            setText("");
          }, 800);
        }
      }, 70);
      return () => clearInterval(interval);
    }

    // After finishing all lines, show main page and set flag in session storage
    if (currentLine >= lines.length && showIntro) {
      const timeout = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('introSeen', 'true');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [showIntro, currentLine]);

  // === Intro Screen ===
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_1px,transparent_1px)] [background-size:35px_35px] opacity-40"></div>

        {/* Terminal box */}
        <div className="relative z-10 bg-black/80 border border-green-500/40 rounded-lg shadow-lg shadow-green-500/20 p-6 font-mono text-green-400 text-lg max-w-2xl w-[90%]">
          {/* Show previous lines instantly */}
          {lines.slice(0, currentLine).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}

          {/* Typing current line */}
          {currentLine < lines.length && (
            <p>
              {text}
              <span className="animate-pulse">_</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // === Main Website Pages ===
  return (
    <HomePage />
  );
}