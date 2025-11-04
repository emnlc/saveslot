import { Link } from "@tanstack/react-router";

const Footer = () => {
  return (
    <>
      <footer className="w-full bg-base-200/80 py-12 self-end">
        <div className="container mx-auto flex flex-row items-end justify-between gap-4 px-4 md:px-0">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1 md:gap-2">
              <img
                src="/saveslot.svg"
                alt="SaveSlot logo"
                className="w-4 md:w-6"
              />
              <div className="flex items-start md:items-center gap-2">
                <Link to="/" className="hover:brightness-[90%] transition-all">
                  <span className="font-semibold">
                    <span className="text-primary">Save</span>Slot
                  </span>
                </Link>
              </div>
            </div>
            <p className="text-left text-xs md:text-sm text-muted-foreground ">
              &copy; {new Date().getFullYear()} SaveSlot
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
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
