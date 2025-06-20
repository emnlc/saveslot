import { useEffect } from "react";
import { useGameInfo } from "../../hooks/useGameInfo";
import LightboxGallery from "./LightboxGallery";

import GamePageHeader from "./GamePageHeader";
import GamePageDetails from "./GamePageDetails";
import GamePageStores from "./GamePageStores";
import GamePageTrailer from "./GamePageTrailer";

type Props = {
  gamesSlug: string;
};

const GamePage = (props: Props) => {
  const { data, isLoading, isError } = useGameInfo(props.gamesSlug);

  useEffect(() => {
    if (data) {
      document.title = data.name;
    } else {
      document.title = "Game Page";
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Error fetching game data.</p>;
  console.log(data);

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image Header */}
      <div
        className="max-w-6xl mx-auto h-[450px] bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url(https://images.igdb.com/igdb/image/upload/t_1080p/${data.artworks ? data.artworks[0].image_id : data.cover.image_id}.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-base-100/60 via-base-100/70 to-base-100/90" />
        <div className=" absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-base-100" />
        <div className="absolute top-0 left-0 h-full w-48 md:bg-gradient-to-r md:from-base-100 md:to-transparent" />
        <div className="absolute top-0 right-0 h-full w-48 md:bg-gradient-to-l md:from-base-100 md:to-transparent" />
      </div>

      {/* Game Info Section */}
      <div className="relative -mt-96 md:-mt-40 w-full px-4 md:px-6 max-w-5xl mx-auto ">
        <div className="flex flex-col justify-center items-center md:flex-row gap-8 md:items-start">
          <GamePageHeader data={data} />
        </div>

        {/* additional game info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 my-8">
          {/* about / summary */}
          <GamePageDetails data={data} />

          {/* right of grid */}
          <div className="col-span-1 flex flex-col gap-4">
            {data.videos && (
              <div className="flex flex-col gap-2 ">
                <h2 className="text-lg font-bold">Trailer</h2>
                <GamePageTrailer data={data} />
              </div>
            )}

            {data.screenshots && (
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">Screenshots</h2>
                <LightboxGallery
                  screenshots={data.screenshots}
                ></LightboxGallery>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <GamePageStores data={data} />
            </div>
          </div>

          {/* reviews section */}
          <div className="col-span-1 md:col-span-2 flex ">
            <h1 className="text-xl font-bold">Reviews</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
