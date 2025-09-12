import React from "react";
import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-base-black font-inter text-foreground w-full">
      <Header />
      <main>{children}</main>
      <footer className="border-t p-8">
        <section className="flex items-center justify-between text-sm">
          <p>
            <span className="text-gray-300">Brought to you by </span>
            <a href="https://rodweleo.vercel.app" target="_blank">
              <button className="font-bold underline">Rodwell Leo</button>
            </a>
            .
          </p>
          <p>
            <span className="text-gray-300">
              Copyright &copy;{currentYear} Neuroverse
            </span>
          </p>
        </section>
      </footer>
    </div>
  );
};

export default Layout;
