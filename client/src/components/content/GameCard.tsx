import { Link } from "@tanstack/react-router";

type Props = {
  id: string;
  name?: string;
  slug: string;
  coverId: string;
  first_release_date?: string;
  release_date_human?: string;
};

const GameCard = (props: Props) => {
  return (
    <>
      <Link
        key={props.id}
        to="/games/$gamesSlug"
        params={{ gamesSlug: props.slug }}
        className="group relative rounded overflow-hidden border border-base-300 hover:border-primary transition-colors w-full"
      >
        <div className="aspect-[3/4] w-full">
          <img
            src={`https://images.igdb.com/igdb/image/upload/t_1080p/${props.coverId}.jpg`}
            className="w-full h-full object-cover transition duration-300 group-hover:brightness-25"
          />

          {/* Hover Info Overlay */}
          <div className="absolute inset-0  text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            {props.name && (
              <h3 className="text-xs font-semibold">{props.name}</h3>
            )}

            {props.release_date_human && (
              <p className="text-xs text-gray-300">
                {props.release_date_human}
              </p>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default GameCard;
