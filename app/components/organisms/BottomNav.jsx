"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
const navItems = [
  { href: "/feed", iconSrc: "/_ionicons_svg_ios-pulse.png", label: "Trends" },
  { href: "/categories", iconSrc: "/_ionicons_svg_ios-microphone.png", label: "Categories" },
  { href: "/", iconSrc: "/_ionicons_svg_md-wifi.png", label: "Home", isCenter: true },
  { darkMode: true, iconSrc: "/_ionicons_svg_ios-contrast.png", label: "Dark mode" },
  { href: "/profile", iconSrc: "/Path%20343.png", label: "Profile" },
];  

export function BottomNav() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  function NavIcon({ src, alt, dimmed = false }) {
    const opacityClass = dimmed ? "opacity-50" : "opacity-100";

    // In dark mode we render the icon as a mask and fill it with the brand gradient.
    // This avoids blue-tinted raster PNGs while keeping the same icon assets.
    if (isDarkMode) {
      return (
        <span
          aria-hidden="true"
          className={`inline-block w-6 h-6 ${opacityClass} bg-linear-to-r from-[#FF6A00] to-[#EE0979]`}
          style={{
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      );
    }

    return <img src={src} alt={alt} className={`w-6 h-6 object-contain ${opacityClass}`} />;
  }

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111625] shadow-[0px_-5px_12.5px_rgba(0,0,0,0.15)] dark:shadow-[0px_-5px_12.5px_rgba(0,0,0,0.5)] border-t border-gray-200 dark:border-transparent z-50 transition-colors duration-200"
      style={{ height: '65px' }}
    >
      <div className="max-w-md mx-auto h-full flex items-center justify-around px-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const isCenter = item.isCenter;
          
          if (item.darkMode) {
            return (
              <button
                key="darkmode"
                type="button"
                onClick={toggleDarkMode}
                className="flex flex-col items-center justify-center transition-opacity hover:opacity-80"
                aria-label={isDarkMode ? "Light mode" : "Dark mode"}
              >
                {item.iconSrc && <NavIcon src={item.iconSrc} alt={item.label} dimmed={!isDarkMode} />}
              </button>
            );
          }
          
          if (isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="relative flex items-center justify-center"
              >
                <div className="w-[45px] h-[45px] rounded-full bg-linear-to-r from-[#FF6A00] to-[#EE0979] flex items-center justify-center shadow-lg">
                  <div className="w-[35px] h-[35px] rounded-full  flex items-center justify-center">
                    <div className="w-[25px] h-[25px] rounded-full  dark:border-white flex items-center justify-center">
                      <NavIcon src={item.iconSrc} alt={item.label} dimmed={false} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex flex-col items-center justify-center transition-opacity hover:opacity-80"
            >
              {item.iconSrc && <NavIcon src={item.iconSrc} alt={item.label} dimmed={!isActive} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
