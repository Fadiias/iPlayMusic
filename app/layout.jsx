import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "./components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | iPlayMusic",
    default: "iPlayMusic - Your Music Elevated"
  },
  description: "Experience Spotify like never before with iPlayMusic - a modern, beautiful music dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;var m=localStorage.getItem('darkMode')==='true';if(m)d.classList.add('dark');else d.classList.remove('dark');})();`,
          }}
        />
      </head>
      <body className={`${poppins.className} antialiased bg-white text-gray-900 dark:bg-[#341931] dark:text-white transition-colors duration-200 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
