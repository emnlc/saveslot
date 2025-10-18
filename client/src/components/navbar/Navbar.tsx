import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import ThemeToggle from "../controls/ThemeToggle";
import { UserAuth } from "@/context/AuthContext";
import Dropdown from "./NavbarDropdown";
import SearchDropdown from "./SearchDropdown";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

const Navbar = () => {
  const { profile, session, loading } = UserAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Desktop search - close if clicking outside
      if (searchRef.current && !searchRef.current.contains(target)) {
        setDebouncedQuery("");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      // Reset search state
      setSearchQuery("");
      setDebouncedQuery("");
      setShowMobileSearch(false);
      // Blur the mobile search input to dismiss keyboard
      mobileSearchInputRef.current?.blur();
      navigate({ to: "/search", search: { q: query } });
    }
  };

  // Handler for when a game is clicked in the dropdown
  const handleGameClick = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowMobileSearch(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-base-200/80 shadow-sm">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-0 justify-between">
          {/* Logo */}
          <Link to="/" className="group relative inline-block">
            <span className="text-xl font-bold">
              <span className="text-primary">Save</span>Slot
            </span>
            <span className="absolute left-0 -bottom-1 h-[4px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/games"
              className="text-sm text-base-content hover:text-primary transition-all"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              Games
            </Link>

            {/* Desktop Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative w-80">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-sm w-full pl-10 bg-base-100 focus:outline-none focus:ring-0 focus:input-primary"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50 pointer-events-none z-10" />
                </div>
              </form>
              {debouncedQuery.length >= 2 && (
                <SearchDropdown
                  query={debouncedQuery}
                  userId={profile?.id}
                  onClose={handleGameClick}
                />
              )}
            </div>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Avatar (if logged in) */}
            {!loading && profile && session && (
              <Link to={`/u/$username`} params={{ username: profile.username }}>
                <img
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                  }
                  alt={profile.username}
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            )}

            {/* Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          showMobileMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-base-200 shadow-xl transform transition-transform duration-300 ${
            showMobileMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-4">
            {/* Close button */}
            <button
              onClick={() => setShowMobileMenu(false)}
              className="self-end btn btn-ghost btn-sm btn-circle mb-4"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Menu Items */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/games"
                className="text-lg font-medium hover:text-primary py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Games
              </Link>

              {!loading && profile && session ? (
                <>
                  <Link
                    to={`/u/$username`}
                    params={{ username: profile.username }}
                    className="text-lg font-medium hover:text-primary py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-lg font-medium hover:text-primary py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/sign-up"
                    className="text-lg font-medium hover:text-primary py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}

              <div className="divider"></div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="text-lg font-medium">Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Spotlight Search */}
      <div
        className={`fixed inset-0 z-50 md:hidden  ${
          showMobileSearch ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop with blur - always rendered */}
        <div
          className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
          style={{
            opacity: showMobileSearch ? 1 : 0,
          }}
          onClick={() => {
            setShowMobileSearch(false);
            setSearchQuery("");
            setDebouncedQuery("");
          }}
        />

        {/* Dark overlay - transitions smoothly */}
        <div
          className="absolute inset-0 bg-black/80 transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: showMobileSearch ? 1 : 0,
          }}
        />

        {/* Search Container */}
        <div
          className="absolute inset-x-4 top-20 transition-opacity duration-300"
          ref={mobileSearchRef}
          style={{
            opacity: showMobileSearch ? 1 : 0,
          }}
        >
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input input-lg w-full pl-14 bg-base-100 shadow-2xl"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50 pointer-events-none z-10" />
            </div>
          </form>

          {/* Mobile Search Dropdown */}
          {debouncedQuery.length >= 2 && (
            <SearchDropdown
              query={debouncedQuery}
              userId={profile?.id}
              onClose={handleGameClick}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
