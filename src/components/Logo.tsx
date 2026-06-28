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

  // Extract height classes from the passed className to prevent layout clipping with the tagline
  const classes = className.split(" ");
  const heightClass = classes.find(c => c.startsWith("h-")) || "";
  const otherClasses = classes.filter(c => !c.startsWith("h-")).join(" ");

  // Standard sizes if no explicit height class is provided
  const iconSizes = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-12 w-12 rounded-2xl",
    lg: "h-20 w-20 rounded-[24px]",
    xl: "h-32 w-32 rounded-[36px]"
  };

  const textSizes = {
    sm: "text-xl font-black tracking-tight",
    md: "text-3xl font-black tracking-tight",
    lg: "text-5xl font-black tracking-tight",
    xl: "text-7xl font-black tracking-tight"
  };

  const taglineSizes = {
    sm: "text-[7px] tracking-[0.24em] mt-0.5",
    md: "text-[10px] tracking-[0.3em] mt-1",
    lg: "text-[14px] tracking-[0.34em] mt-2",
    xl: "text-[20px] tracking-[0.38em] mt-3"
  };

  // Determine actual sizing classes based on explicit height or size presets
  let finalIconClass = iconSizes[size];
  let finalTaglineClass = taglineSizes[size];
  let finalTextClass = textSizes[size];

  if (heightClass) {
    // Dynamically adjust icon, text and tagline sizing based on explicit height class
    finalIconClass = "h-full aspect-square";
    
    if (heightClass === "h-10") {
      finalTextClass = "text-xl md:text-2xl font-black tracking-tight";
      finalTaglineClass = "text-[7.5px] tracking-[0.24em] mt-0.5";
    } else if (heightClass === "h-16") {
      finalTextClass = "text-3xl md:text-4xl font-black tracking-tight";
      finalTaglineClass = "text-[11px] tracking-[0.3em] mt-1";
    } else {
      finalTextClass = "text-2xl font-black tracking-tight";
      finalTaglineClass = "text-[9px] tracking-[0.26em] mt-0.5";
    }
  }

  // Derive rounding based on the height or preset
  const roundingClass = heightClass === "h-10" ? "rounded-xl" : "rounded-2xl";

  return (
    <div className={`flex flex-col select-none justify-center ${otherClasses}`}>
      {/* Container with optional height constraint */}
      <div className={`flex items-center gap-3 md:gap-4 ${heightClass}`}>
        {/* Monogram Vector Graphic Icon - Always uses a dark premium galactic background for high contrast */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1.5 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-[#020617] border border-slate-800 shadow-2xl ${finalIconClass} ${roundingClass}`}
        >
          {/* Deep cosmic atmospheric gradient glow inside the emblem */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/25 via-transparent to-transparent opacity-90" />
          
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1.5 z-10"
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
              d="M 22 78 C 34 88, 66 88, 78 78"
              stroke="url(#thrust-fire-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Blazing Outer Exhaust Plume (Animated vertical flicker) */}
            <motion.path
              animate={{ 
                d: [
                  "M 41 71 L 50 96 L 59 71 Z", 
                  "M 41 71 L 50 84 L 59 71 Z", 
                  "M 41 71 L 50 96 L 59 71 Z"
                ] 
              }}
              transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
              fill="url(#thrust-fire-grad)"
            />
            
            {/* Incandescent Core Flame (Super hot center) */}
            <motion.path
              animate={{ 
                d: [
                  "M 45 71 L 50 85 L 55 71 Z", 
                  "M 45 71 L 50 78 L 55 71 Z", 
                  "M 45 71 L 50 85 L 55 71 Z"
                ] 
              }}
              transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
              fill="#ffffff"
              opacity="0.95"
            />

            {/* 2. GRADUATION CAP SKULL-CAP (Layered at the base) */}
            <path
              d="M 24 50 V 58 C 24 67, 76 67, 76 58 V 50"
              fill="url(#cap-base-grad)"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* 3. GRADUATION CAP DIAMOND PLATE (Supercharged scale: extra wide and bold) */}
            <path
              d="M 50 25 L 94 44 L 50 63 L 6 44 Z"
              fill="url(#cap-plate-grad)"
              fillOpacity="0.9"
              stroke="#a78bfa"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            
            {/* Geometric accent line on diamond plate */}
            <path
              d="M 50 31 L 84 44 L 50 57 L 16 44 Z"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.7"
            />

            {/* 4. GRADUATION TASSEL */}
            {/* Tassel Center Peg */}
            <circle cx="50" cy="44" r="3.5" fill="#ffffff" />
            
            {/* Tassel cord curving gracefully, windswept by rocket launch */}
            <path
              d="M 50 44 C 32 45, 14 51, 12 65"
              stroke="#f472b6"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tassel bead */}
            <circle cx="12" cy="65" r="2.5" fill="#ec4899" />
            {/* Tassel fringe block */}
            <path
              d="M 12 65 L 7 78 H 17 Z"
              fill="url(#rocket-accent-grad)"
              stroke="#ffffff"
              strokeWidth="1"
              strokeLinejoin="round"
            />

            {/* 5. THE ROCKET SHIP (SUPERSIZED & CHUNKY CHASSIS FOR HIGHEST LEGIBILITY) */}
            <g id="rocket-fuselage">
              {/* Left Rocket Wing Stabilizer */}
              <path
                d="M 37 45 L 16 70 C 16 70, 28 68, 37 60 Z"
                fill="url(#rocket-accent-grad)"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              
              {/* Right Rocket Wing Stabilizer */}
              <path
                d="M 63 45 L 84 70 C 84 70, 72 68, 63 60 Z"
                fill="url(#rocket-accent-grad)"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              {/* Main Thick Geometric Rocket Body - Wider fuselage */}
              <path
                d="M 50 5 C 41 18, 37 42, 37 66 H 63 C 63 42, 59 18, 50 5 Z"
                fill="url(#rocket-hull-grad)"
                stroke="#020617"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Rocket Nose Cone Accent Tip - Enlarged */}
              <path
                d="M 50 5 C 46 12, 44 18, 43 23 H 57 C 56 18, 54 12, 50 5 Z"
                fill="url(#rocket-accent-grad)"
              />

              {/* Massive Viewport Window - Easily visible even when logo is small */}
              <circle cx="50" cy="33" r="8" fill="#0f172a" stroke="#ffffff" strokeWidth="2.2" />
              <circle cx="47" cy="30" r="2.5" fill="#38bdf8" /> {/* Prominent reflection highlight */}
              
              {/* Vertical technical panel line */}
              <line x1="50" y1="41" x2="50" y2="61" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="2 2" />
            </g>

            {/* 6. SYSTEM ACCENT STARS */}
            <circle cx="15" cy="15" r="2" fill="#38bdf8" opacity="0.8" />
            <circle cx="85" cy="15" r="2" fill="#ffffff" opacity="0.9" />

            {/* Glowing Celestial Launch Target Star at peak apex */}
            <g transform="translate(50, 4)">
              <circle cx="0" cy="0" r="16" fill="url(#star-glow-rad)" />
              
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
                d="M 0 -12 L 4 -4 L 12 0 L 4 4 L 0 12 L -4 4 L -12 0 L -4 -4 Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        </motion.div>

        {/* Text Brand Name with Premium Contrast Design */}
        {!iconOnly && (
          <div className="flex flex-col justify-center leading-none">
            <span className={`${finalTextClass} font-sans font-black tracking-tight flex items-center leading-none`}>
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
        <span className={`font-sans font-bold uppercase ${isDarkBg ? "text-slate-400" : "text-slate-600"} pl-0.5 leading-none ${finalTaglineClass}`}>
          LEARN<span className="text-pink-500 font-extrabold font-sans">.</span> GROW<span className="text-purple-500 font-extrabold font-sans">.</span> LAUNCH<span className="text-sky-400 font-extrabold font-sans">.</span>
        </span>
      )}
    </div>
  );
}
