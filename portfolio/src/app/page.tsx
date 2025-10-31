"use client";

import SpinningYinYang from "../components/YinYang";
import Image from "next/image";
import ProjectCarousel from "@/components/ProjectCarousel";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-white bg-linear-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a] scroll-smooth">
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />

      {/* === NAVBAR === */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Left side — name/title */}
          <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white text-center sm:text-left w-full sm:w-auto">
            Caleb Standfield ・ CS ・ Computer Science
          </h1>

          {/* Right side — nav links + pfp */}
          <div className="flex items-center gap-6">
            <ul className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-8 text-xs sm:text-sm uppercase tracking-widest text-gray-300">
              <li>
                <a
                  href="#projects"
                  className="hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#resume"
                  className="hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Resume
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Contact
                </a>
              </li>
            </ul>

            {/* Profile picture on far right */}
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
          </div>
        </div>
      </nav>

      {/* === HERO / INTRO === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen py-20 lg:py-0 px-6 sm:px-12 md:px-24">
        {/* LEFT SIDE — Text */}
        <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start space-y-6">
          <div className="mt-16 sm:mt-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              Caleb
              <br />
              Standfield
            </h1>

            <div className="flex flex-col items-center lg:items-start mt-8 space-y-4">
              <Image
                src="/pfp.jpg"
                alt="Caleb Standfield"
                width={350}
                height={250}
                className="rounded-full border-2 border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.3)] object-cover brightness-110 contrast-110"
              />
            </div>

            <div className="mt-4 h-[3px] w-24 mx-auto lg:mx-0 bg-linear-to-r from-white to-gray-400 rounded-full" />

            <p className="mt-6 text-lg sm:text-xl md:text-2xl font-semibold text-white relative isolate drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              University of Utah
            </p>

            <ul className="list-disc list-inside mt-4 text-sm sm:text-base md:text-lg text-white relative isolate drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] space-y-1 text-center lg:text-left">
              <li>B.S. in Computer Science</li>
              <li>Undergraduate Certificate in Data Science</li>
              <li>Minor in Japanese</li>
              <li>Graduation: Dec 2026</li>
            </ul>

            {/* Scroll down indicator */}
            <div className="mt-12 flex flex-col items-center animate-bounce text-gray-400">
              <p className="text-xs tracking-widest uppercase">Scroll Down</p>
              <div className="mt-2 w-px h-6 bg-gray-400"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Glowing Orb with Yin-Yang */}
        <div className="relative flex items-center justify-center mt-20 lg:mt-0">
          <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[440px] h-[260px] sm:h-80 md:h-[380px] lg:h-[440px] rounded-full bg-linear-to-b from-white to-[#f4f4f4] shadow-[0_0_100px_40px_rgba(255,255,255,0.5)] flex items-center justify-center overflow-hidden">
            {/* Halo */}
            <div className="absolute -inset-16 sm:-inset-20 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_70%)]" />

            {/* Glow Overlay */}
            <div className="absolute inset-0 rounded-full bg-white/40 mix-blend-screen animate-orb-pulse pointer-events-none z-10" />

            {/* Yin-Yang Symbol */}
            <div className="relative flex items-center justify-center z-20">
              <SpinningYinYang />
            </div>
          </div>
        </div>
      </div>

      {/* === PROJECTS SECTION === */}
      <section
        id="projects"
        className="min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 bg-linear-to-b from-[#111111]/90 via-[#0d0d0d]/90 to-[#080808]/90"
      >
        <h2 className="text-4xl font-bold mt-24 mb-12 text-white">Projects</h2>

        {/* Start of Project #1 */}
        <div className="w-full min-h-[60vh] flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 md:px-16 py-10 gap-8">
          {/* Carousel */}
          <div className="w-full lg:w-1/2">
            <ProjectCarousel
              images={["/project1a.png", "/project1b.png", "/project1c.png"]}
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-4 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-white">Placeholder</h3>
            <p className="text-gray-200 leading-relaxed text-lg">Placeholder</p>
            <div className="flex gap-4 justify-center lg:justify-start pt-6">
              <a
                href="https://github.com/yourusername/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white text-black font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* End of Project 1 */}

        {/* Start of Project #1 */}
        <div className="w-full min-h-[60vh] flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 md:px-16 py-10 gap-8">
          {/* Carousel */}
          <div className="w-full lg:w-1/2">
            <ProjectCarousel
              images={["/project1a.png", "/project1b.png", "/project1c.png"]}
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-4 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-white">Placeholder</h3>
            <p className="text-gray-200 leading-relaxed text-lg">Placeholder</p>
            <div className="flex gap-4 justify-center lg:justify-start pt-6">
              <a
                href="https://github.com/yourusername/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white text-black font-semibold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* End of Project 1 */}
      </section>

      {/* === ABOUT + CONTACT COMBINED SECTION === */}
      <section
        id="about"
        className="min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 bg-linear-to-b from-[#111111]/90 via-[#0d0d0d]/90 to-[#080808]/90"
      >
        {/* ABOUT */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          About Me
        </h2>

        <p className="max-w-2xl text-center text-gray-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] text-base sm:text-lg leading-relaxed mb-8">
          I am a Computer Science student at the University of Utah; I truly
          have a passion for learning and creating, let me share why.
        </p>

        <p className="max-w-2xl text-center text-gray-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] text-base sm:text-lg leading-relaxed mb-16">
          Learning to create, and creating to learn, is why I love Computer
          Science so much. There will always be more to learn. Actually creating
          something, problem solving, and finding solutions is what made me fall
          in love with programming. I am honestly proud to admit that time
          passes fastest for me when I am coding (very nerdy I know) but I am
          having so much fun and there is no better feeling than seeing a
          project come to life - especially when you have a team to share that
          with. Sounds cringy... I know.
        </p>

        <p className="max-w-2xl text-center text-gray-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] text-base sm:text-lg leading-relaxed mb-16">
          Believe it or not I do have a life outside of coding. I am very much
          into the gym (checkout FitnessWithFriends in my projects section)
          currently aiming for a 255 bench, 315 squat, and 455 deadlift. I am
          one heck of a gamer, current games: Clair Obscure Expeditoin 33 and
          Battlefield 6. Lastly I do love all things Japan. Ive been studying it
          for 3 almost 4 years now and Ive met some of the coolest people and
          had the best experiences because of it. Always happy to practice
          Japanese or talk about Japan with anyone who wants :)
        </p>

        {/* CONTACT */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Contact
        </h2>

        <p className="text-gray-100 text-center text-base sm:text-lg max-w-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
          Feel free to reach out! I am always open to new opportunities,
          collaborations, or even just to talk about why the Rust borrow checker
          is the leading cause of sadness among us Rustaceans.
        </p>

        <a
          href="mailto:caleb@example.com"
          className="mt-8 px-8 py-3 bg-linear-to-r from-white via-gray-200 to-white text-black font-semibold rounded-full shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:shadow-[0_0_45px_rgba(255,255,255,0.8)] hover:scale-105 transition-all duration-300"
        >
          Email Me
        </a>
      </section>
    </main>
  );
}
