import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import type { Splide as SplideComponent } from "@splidejs/react-splide";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "@splidejs/react-splide/css";
import { Game } from "@/Interface";
import { useRef } from "react";

import GameCard from "./GameCard";

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
          flickMaxPages: 1,
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
              <div className="flex">
                <GameCard
                  id={game.id.toString()}
                  name={game.name}
                  slug={game.slug}
                  coverId={game.cover_id || ""}
                  release_date_human={game.release_date_human}
                />
              </div>
              {date ? (
                <div className=" text-center">{game.release_date_human}</div>
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
