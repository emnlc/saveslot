import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import type { Splide as SplideComponent } from "@splidejs/react-splide";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "@splidejs/react-splide/css";
import { Game } from "@/Interface";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { convertToDate } from "@/utils/gameHelpers";

type Props = {
  data: Game[];
  date?: boolean;
};

const GameCarousel = ({ data, date }: Props) => {
  const splideRef = useRef<SplideComponent>(null);

  return (
    <>
      <Splide
        ref={splideRef}
        hasTrack={false}
        options={{
          perPage: 6,
          gap: "1rem",
          pagination: false,
          arrows: true,
          rewind: false,
          breakpoints: {
            1024: { perPage: 4 },
            768: { perPage: 3, arrows: false },
            640: { perPage: 2, arrows: false },
          },
        }}
        aria-label="Upcoming Games Carousel"
        className="relative"
      >
        <SplideTrack className="px-12">
          {data.map((game) => (
            <SplideSlide key={game.id}>
              <Link
                to="/games/$gamesSlug"
                params={{ gamesSlug: game.slug }}
                className="block group relative rounded-lg overflow-hidden border border-neutral hover:border-primary transition-colors"
              >
                <div className="aspect-[3/4]">
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`}
                    alt={game.name}
                    className="col-span-1 object-fill transition duration-300 group-hover:brightness-25"
                  />

                  <div className="absolute inset-0  text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-sm font-semibold">{game.name}</h3>
                  </div>
                </div>
              </Link>
              {date ? (
                <div className=" text-center">
                  {convertToDate(game.first_release_date)}
                </div>
              ) : (
                <></>
              )}
            </SplideSlide>
          ))}
        </SplideTrack>

        <div className="splide__arrows">
          <ChevronLeft className="splide__arrow splide__arrow--prev select-none" />

          <ChevronRight className="splide__arrow splide__arrow--next select-none" />
        </div>
      </Splide>
    </>
  );
};

export default GameCarousel;
