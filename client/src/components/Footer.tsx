import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <>
      <footer className="w-full bg-base-200/80 py-6">
        <div className="container mx-auto flex flex-row items-center justify-between gap-4 px-4 md:px-0">
          <div>
            <div className="flex items-start md:items-center gap-2">
              <Link to="/" className="hover:brightness-[90%] transition-all">
                <span className="font-semibold">
                  <span className="text-primary">Save</span>Slot
                </span>
              </Link>
            </div>
            <p className="text-left text-xs md:text-sm text-muted-foreground ">
              &copy; {new Date().getFullYear()} SaveSlot. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div>
              <a
                className="hover:text-primary transition-colors"
                target="_blank"
                href="https://github.com/emnlc/saveslot"
              >
                <Github className="h-4 w-4 md:h-5 md:w-5" />
              </a>
            </div>
            <span className="text-xs md:text-sm">
              Powered by{" "}
              <a
                className="hover:text-[#9047FE] transition-colors"
                href="https://www.igdb.com/"
                target="_blank"
              >
                IGDB
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
