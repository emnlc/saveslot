import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

import { UserAuth } from "@/context/AuthContext";

import Dropdown from "./Dropdown";

const Navbar = () => {
  const { profile, session, loading } = UserAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-base-200/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-0 justify-between">
        <Link to="/" className="group relative inline-block">
          <span className="text-xl font-bold">
            <span className="text-primary">Save</span>Slot
          </span>
          <span className="absolute left-0 -bottom-1 h-[4px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/games" className="text-sm font-medium hover:text-primary">
            Games
          </Link>
          <div className="relative max-w-36">
            <input
              type="text"
              placeholder="Search"
              className="input input-sm w-full pl-10 bg-base-100 focus:outline-none focus:ring-0 focus:input-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {!loading && profile && session ? (
            <>
              <Dropdown />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium hover:text-primary"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="text-sm font-medium hover:text-primary"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
