export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* === NAVBAR === */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          {/* Left side — name/title */}
          <a href="#home">
            <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white">
              Caleb Standfield ・ CS ・ Computer Science
            </h1>
          </a>

          {/* Right side — social links */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <a
                href="https://github.com/CalebStandfield"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="hover:scale-150 transition-transform duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.41 7.861 10.94.575.1.786-.25.786-.556 0-.274-.01-1.002-.015-1.966-3.197.695-3.872-1.542-3.872-1.542-.523-1.33-1.277-1.686-1.277-1.686-1.045-.714.079-.699.079-.699 1.155.08 1.763 1.186 1.763 1.186 1.028 1.76 2.7 1.252 3.357.958.104-.744.402-1.252.731-1.54-2.55-.29-5.232-1.277-5.232-5.683 0-1.256.449-2.285 1.184-3.09-.118-.29-.513-1.46.113-3.043 0 0 .965-.308 3.164 1.18.916-.255 1.9-.382 2.878-.387.977.005 1.961.132 2.878.387 2.199-1.488 3.162-1.18 3.162-1.18.628 1.584.233 2.754.115 3.043.736.805 1.184 1.834 1.184 3.09 0 4.417-2.688 5.39-5.248 5.675.41.353.777 1.05.777 2.118 0 1.529-.014 2.76-.014 3.137 0 .308.209.662.792.55C20.713 21.405 24 17.085 24 12 24 5.648 18.852.5 12 .5z" />
                </svg>
              </a>
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-black bg-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                GitHub
              </span>
            </div>

            <div className="relative group">
              <a
                href="https://www.linkedin.com/in/caleb-standfield/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="hover:scale-150 transition-transform duration-300"
              >
                {/* LinkedIn SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <path d="M19 0h-14c-2.757 0-5 2.243-5 5v14c0 2.757 2.243 5 5 5h14c2.757 0 5-2.243 5-5v-14c0-2.757-2.243-5-5-5zm-11.5 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764c.968 0 1.75.79 1.75 1.764s-.782 1.764-1.75 1.764zm14 12.268h-3v-5.604c0-3.356-4-3.1-4 0v5.604h-3v-11h3v1.671c1.396-2.586 7-2.777 7 2.476v6.853z" />
                </svg>
              </a>

              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-black bg-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* === BLANK CANVAS === */}
      <section id="home" className="min-h-screen bg-black" />
    </main>
  );
}
