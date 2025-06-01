import ThemeToggle from "./ThemeToggle";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

const Navbar = () => {
  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-base-200/80 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="group relative inline-block">
              <span className="text-xl font-bold">
                <span className="text-primary">Save</span>Slot
              </span>
              <span className="absolute left-0 -bottom-1 h-[4px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 ">
            <Link
              to="/games"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Games
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Reviews
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Lists
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Activity
            </Link>

            <div className="relative max-w-36">
              <input
                type="text"
                placeholder="Search"
                className="input focus:outline-none focus:ring-0 focus:input-primary transition-colors input-sm w-full pl-10 bg-base-100 focus:bg-base-100"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 w-4 h-4 pointer-events-none z-10" />
            </div>
          </nav>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Log in
            </Link>
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sign up
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
