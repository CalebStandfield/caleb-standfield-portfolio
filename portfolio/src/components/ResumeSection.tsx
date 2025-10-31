"use client";
import { motion } from "framer-motion";

export default function ResumeSection() {
  return (
    <section className="w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-center px-8 md:px-16 py-16 gap-12 relative">
      {/* Left content */}
      <div className="flex flex-col items-center lg:items-start space-y-6 w-full lg:w-1/2 text-center lg:text-left">
        <h2 className="text-4xl font-bold text-white">My Resume</h2>
        <p className="text-gray-300 text-lg max-w-md">
          Here is my resume. You can view it here directly or download a copy
          below. However thats only a single page. So make sure to checkout my
          github for more of my projects! :)
        </p>

        {/* Download Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4"
        >
          <a href="/Caleb_Standfield_Resume.pdf" download>
            <button className="group relative overflow-hidden px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 via-yellow-500 to-amber-400 text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,200,80,0.4)] hover:shadow-[0_0_35px_rgba(255,200,80,0.7)]">
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-transform group-hover:translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Download Resume
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-yellow-400 via-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </a>
        </motion.div>
      </div>

      {/* Resume PDF */}
      <div className="relative w-full lg:w-2/3 flex justify-center">
        <div className="rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(255,200,80,0.4)] w-full max-w-[700px] h-[80vh] bg-transparent backdrop-blur-sm border border-amber-300/30">
          <iframe
            src="/Caleb_Standfield_Resume.pdf"
            className="w-full h-full border-none hide-scrollbar"
            title="Caleb Standfield's Resume PDF"
            style={{ background: "transparent" }}
          />
        </div>
      </div>
    </section>
  );
}
