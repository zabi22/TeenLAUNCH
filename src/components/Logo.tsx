import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "light" | "dark"; // "dark" = dark background (white text), "light" = light background
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export default function Logo({ className = "", iconOnly = false, variant = "dark", size = "md", showTagline = true }: LogoProps) {
  const isDarkBg = variant === "dark";

  // Sizes for the icon container - scaled up slightly for better visibility
  const iconSizes = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-14 h-14 rounded-2xl",
    lg: "w-24 h-24 rounded-[28px]",
    xl: "w-36 h-36 rounded-[40px]"
  };

  // Font sizes for the text brand name
  const textSizes = {
    sm: "text-xl font-bold tracking-tight",
    md: "text-3xl font-extrabold tracking-tight",
    lg: "text-5xl font-black tracking-tight",
    xl: "text-7xl font-black tracking-tight"
  };

  // Tagline sizing
  const taglineSizes = {
    sm: "text-[7.5px] tracking-[0.24em] mt-0.5",
    md: "text-[10.5px] tracking-[0.3em] mt-1",
    lg: "text-[15px] tracking-[0.34em] mt-2.5",
    xl: "text-[22px] tracking-[0.38em] mt-4"
  };

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-3 md:gap-4">
        {/* Monogram Vector Graphic Icon - Always uses a dark premium galactic background for high contrast */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1.5 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-[#020617] border border-slate-800 shadow-2xl ${iconSizes[size]}`}
        >
          {/* Deep cosmic atmospheric gradient glow inside the emblem */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/25 via-transparent to-transparent opacity-90" />
          
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1 z-10"
          >
            <defs>
              {/* Mortarboard Diamond Plate - Premium Violet-Indigo Metallic Gradient */}
              <linearGradient id="cap-plate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />   {/* Violet */}
                <stop offset="50%" stopColor="#6366f1" />  {/* Indigo */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
              </linearGradient>

              {/* Cap Skull Band - Deep Cosmic Midnight Indigo */}
              <linearGradient id="cap-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />   {/* Royal Indigo */}
                <stop offset="100%" stopColor="#1e1b4b" /> {/* Deep Navy */}
              </linearGradient>

              {/* Rocket Body - High-Tech Platinum Metallic Hull */}
              <linearGradient id="rocket-hull-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />   {/* Crisp White */}
                <stop offset="60%" stopColor="#f8fafc" />  {/* Platinum Slate */}
                <stop offset="100%" stopColor="#cbd5e1" /> {/* Silver Grey */}
              </linearGradient>

              {/* Rocket Nose Cone & Wing Accents - Vibrant Cyber Pink */}
              <linearGradient id="rocket-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />   {/* Bright Pink */}
                <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia */}
              </linearGradient>

              {/* Cybernetic Exhaust Flame - Electric Sky Blue */}
              <linearGradient id="thrust-fire-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" /> {/* Bright Cyan */}
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />  {/* Indigo */}
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />   {/* Violet Fade */}
              </linearGradient>

              {/* Star Celestial Core Aura */}
              <radialGradient id="star-glow-rad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#f472b6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. EXHAUST TRAILS / LAUNCH SHOCKWAVE */}
            {/* Soft geometric ripple at the base of rocket thruster */}
            <motion.path
              animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.5, 0.9, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              d="M 24 78 C 36 88, 64 88, 76 78"
              stroke="url(#thrust-fire-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Blazing Outer Exhaust Plume (Animated vertical flicker) */}
            <motion.path
              animate={{ 
                d: [
                  "M 41 68 L 50 96 L 59 68 Z", 
                  "M 41 68 L 50 86 L 59 68 Z", 
                  "M 41 68 L 50 96 L 59 68 Z"
                ] 
              }}
              transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
              fill="url(#thrust-fire-grad)"
            />
            
            {/* Incandescent Core Flame (Super hot center) */}
            <motion.path
              animate={{ 
                d: [
                  "M 45 68 L 50 84 L 55 68 Z", 
                  "M 45 68 L 50 75 L 55 68 Z", 
                  "M 45 68 L 50 84 L 55 68 Z"
                ] 
              }}
              transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
              fill="#ffffff"
              opacity="0.95"
            />

            {/* 2. GRADUATION CAP SKULL-CAP */}
            <path
              d="M 26 51 V 58 C 26 66, 74 66, 74 58 V 51"
              fill="url(#cap-base-grad)"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* 3. GRADUATION CAP DIAMOND PLATE (Larger, wider, and more dramatic foundation) */}
            <path
              d="M 50 30 L 92 44 L 50 58 L 8 44 Z"
              fill="url(#cap-plate-grad)"
              fillOpacity="0.9"
              stroke="#a78bfa"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            
            {/* Geometric accent line on diamond plate */}
            <path
              d="M 50 35 L 82 44 L 50 53 L 18 44 Z"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              opacity="0.65"
            />

            {/* 4. GRADUATION TASSEL */}
            {/* Tassel Center Peg */}
            <circle cx="50" cy="44" r="3" fill="#ffffff" />
            
            {/* Tassel cord curving gracefully, windswept by rocket launch */}
            <path
              d="M 50 44 C 34 45, 18 50, 16 62"
              stroke="#f472b6"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tassel bead */}
            <circle cx="16" cy="62" r="2.2" fill="#ec4899" />
            {/* Tassel fringe block */}
            <path
              d="M 16 62 L 12 74 L 20 74 Z"
              fill="url(#rocket-accent-grad)"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* 5. THE ROCKET SHIP (SUPERCHARGED SCALE & CHUNKY HIGHER LEGIBILITY DESIGN) */}
            <g id="rocket-fuselage">
              {/* Left Rocket Wing Stabilizer - Enlarged */}
              <path
                d="M 40 48 L 22 70 C 22 70, 32 68, 40 62 Z"
                fill="url(#rocket-accent-grad)"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              
              {/* Right Rocket Wing Stabilizer - Enlarged */}
              <path
                d="M 60 48 L 78 70 C 78 70, 68 68, 60 62 Z"
                fill="url(#rocket-accent-grad)"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Main Thick Geometric Rocket Body - Wider and bolder fuselage */}
              <path
                d="M 50 6 C 42 20, 40 44, 40 68 H 60 C 60 44, 58 20, 50 6 Z"
                fill="url(#rocket-hull-grad)"
                stroke="#020617"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* Rocket Nose Cone Accent Tip - Enlarged */}
              <path
                d="M 50 6 C 47 14, 45.5 20, 44.5 24 H 55.5 C 54.5 20, 53 14, 50 6 Z"
                fill="url(#rocket-accent-grad)"
              />

              {/* Expanded Circular Viewport Window - Highly visible */}
              <circle cx="50" cy="36" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8" />
              <circle cx="48" cy="34" r="2" fill="#38bdf8" /> {/* High reflection highlight */}
              
              {/* Vertical panel seam line */}
              <line x1="50" y1="43" x2="50" y2="63" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>

            {/* 6. SYSTEM ACCENT STARS */}
            <circle cx="16" cy="18" r="1.5" fill="#38bdf8" opacity="0.8" />
            <circle cx="82" cy="18" r="1.8" fill="#ffffff" opacity="0.9" />

            {/* Glowing Golden Launch Target Star at peak apex */}
            <g transform="translate(50, 4)">
              <circle cx="0" cy="0" r="14" fill="url(#star-glow-rad)" />
              
              {/* 4-Point Star Core */}
              <motion.path
                animate={{ 
                  scale: [1, 1.4, 1],
                  rotate: [0, 8, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut" 
                }}
                d="M 0 -11 L 3.5 -3.5 L 11 0 L 3.5 3.5 L 0 11 L -3.5 3.5 L -11 0 L -3.5 -3.5 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        </motion.div>

        {/* Text Brand Name with Premium Contrast Design */}
        {!iconOnly && (
          <div className="flex flex-col justify-center leading-none">
            <span className={`${textSizes[size]} font-sans font-black tracking-tight flex items-center leading-none`}>
              <span className={isDarkBg ? "text-white" : "text-slate-950"}>
                Teen
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 ml-1 font-sans">
                Launch
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Spacious Premium Tagline matching the wide letter alignment and custom color dots */}
      {showTagline && !iconOnly && (
        <span className={`font-sans font-bold uppercase ${isDarkBg ? "text-slate-400" : "text-slate-600"} pl-0.5 leading-none ${taglineSizes[size]}`}>
          LEARN<span className="text-pink-500 font-extrabold font-sans">.</span> GROW<span className="text-purple-500 font-extrabold font-sans">.</span> LAUNCH<span className="text-sky-400 font-extrabold font-sans">.</span>
        </span>
      )}
    </div>
  );
}
