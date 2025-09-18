import React, { useEffect, useState } from "react";

const Loader: React.FC = () => {
  const [showLoader, setShowLoader] = useState(true);

  // Hide loader after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
      <div className="relative w-20 h-20">
        {/* Outer spinning triangle */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-purple-600"></div>
        </div>

        {/* Inner reverse-spinning triangle */}
        <div
          className="absolute inset-0 animate-spin-reverse-slow"
          style={{ animationDelay: "5s" }}
        >
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-purple-400"></div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
