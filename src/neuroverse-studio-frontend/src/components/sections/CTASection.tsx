import Aurora from "@/components/Aurora";
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="relative mx-auto max-w-6xl w-full py-20 grid place-items-center bg-black text-center overflow-hidden rounded-xl">
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={1}
        amplitude={1.0}
        speed={0.75}
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative z-10 max-w-4xl space-y-4">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl md:text-7xl font-extrabold text-white">
          Ready to{" "}
          <span className="text-gradient-primary">Launch Your AI Agent?</span>
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-lg text-gray-300">
          Build, deploy, and monetize AI agents in minutes.
          <span className="block mt-1">No coding required. Free to start.</span>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/deploy"
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transform transition"
          >
            Deploy Your Agent
          </Link>
          <Link
            to="/agent-marketplace"
            className="px-6 py-4 rounded-2xl border border-purple-400 text-purple-300 font-semibold hover:bg-purple-900/30 hover:scale-105 transform transition"
          >
            ▶ Try Live Demo
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Deploy
            in Minutes
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Earn
            $NEURO Tokens
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 100%
            Decentralized
          </div>
        </div>
      </div>
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={1}
        amplitude={1.0}
        speed={0.75}
        className="absolute bottom-0 w-full h-full"
      />
    </section>
  );
}
