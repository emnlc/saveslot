import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound, Settings, LogOut } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { profile, signOut } = UserAuth();
  const AVATAR_PLACEHOLDER = `https://ui-avatars.com/api/?name=${profile?.username}&background=FE9FA1&color=fff`;
  const navigate = useNavigate();

  const onSignOut = () => {
    signOut();
    navigate({ to: "/" });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative flex justify-center items-center text-left h-10"
      ref={dropdownRef}
    >
      <div className="group">
        <button
          type="button"
          className="inline-flex overflow-clip justify-center items-center rounded cursor-pointer border border-base-300 hover:border-primary w-8 h-8 md:w-10 md:h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <img
            className="object-cover"
            src={profile?.avatar_url ? profile?.avatar_url : AVATAR_PLACEHOLDER}
            alt="User avatar"
          />
        </button>

        <div
          className={`absolute left-1/2 -translate-x-1/2 w-fit md:w-40 mt-1 bg-base-200 rounded-md shadow-lg transition duration-150 ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          } md:group-hover:opacity-100 md:group-hover:visible`}
        >
          <div className="py-1">
            <Link
              className="block px-4 py-2 text-sm hover:bg-base-100/40 text-base-content/80 hover:text-base-content transition-all"
              to={"/u/$username"}
              params={{ username: profile!.username }}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex flex-row items-center gap-2 w-fit">
                <UserRound className="w-4 h-4" /> Profile
              </span>
            </Link>

            <Link
              className="block px-4 py-2 text-sm hover:bg-base-100/40 text-base-content/80 hover:text-base-content transition-all"
              to={"/settings"}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex flex-row items-center gap-2 w-fit">
                <Settings className="w-4 h-4" /> Settings
              </span>
            </Link>

            <button
              onClick={onSignOut}
              className="block px-4 py-2 text-sm cursor-pointer hover:bg-base-100/40 text-base-content/80 hover:text-base-content transition-all w-full text-left"
            >
              <span className="flex flex-row items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
