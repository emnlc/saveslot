import { useEffect } from "react";
import { useGameInfo } from "../../hooks/useGameInfo";
import { convertToDate } from "../../utils/gameHelpers";

import { Star, Heart, ListPlus } from "lucide-react";

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
  if (isError || !data) return <p>Error fetching users.</p>;
  console.log(data);

  const cover_url = `https://images.igdb.com/igdb/image/upload/t_1080p/${data.cover.image_id}.jpg`;

  const trailer =
    data.videos.find(
      (video) =>
        video.name && video.name.trim().toLowerCase().includes("cinematic")
    ) ||
    data.videos.find(
      (video) => video.name && video.name.toLowerCase().includes("story")
    ) ||
    data.videos.find(
      (video) => video.name && video.name.toLowerCase().includes("launch")
    );

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image Header */}
      <div
        className="max-w-6xl mx-auto h-[450px] bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url(https://images.igdb.com/igdb/image/upload/t_1080p/${data.artworks[0].image_id}.jpg)`,
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-base-100/60 via-base-100/70 to-base-100/90" />

        {/* Fade to page background */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-base-100" />

        {/* Left fade */}
        <div className="absolute top-0 left-0 h-full w-48 bg-gradient-to-r from-base-100 to-transparent" />

        {/* Right fade */}
        <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-base-100 to-transparent" />
      </div>

      {/* Game Info Section */}
      <div className="absolute top-72 left-1/2 transform -translate-x-1/2 w-full px-4 md:px-6 max-w-5xl">
        <div className="flex flex-row gap-8 items-start ">
          <img
            src={`${cover_url}`}
            className="w-60 h-auto rounded-lg shadow-lg z-10"
            alt={data.name}
          />

          <div className="w-full flex flex-col gap-4 z-10">
            <h1 className="font-medium text-4xl">{data.name}</h1>

            <div className="flex flex-row items-center gap-2 text-sm">
              <span>{convertToDate(data.first_release_date)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral"></span>
              {data.involved_companies.map(
                (company) =>
                  company.developer && (
                    <span
                      className="hover:text-primary transition-colors"
                      key={company.id}
                    >
                      {company.company.name}
                    </span>
                  )
              )}
            </div>

            <div className="flex flex-row flex-wrap gap-2">
              {data.platforms.map(
                (platform) =>
                  platform && (
                    <span
                      className="badge badge-neutral badge-sm w-fit text-xs hover:text-primary transition-colors"
                      key={platform.id}
                    >
                      {platform.name}
                    </span>
                  )
              )}
            </div>

            <div className="flex flex-row items-center  flex-wrap gap-2">
              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-2 text-xl">
                  <Star fill="#FFD700" stroke="#FFD700" />
                  N/A
                </span>
                <span className="text-xs">User Ratings</span>
              </div>
              <div className="h-12 w-px bg-base-300" />

              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-2 text-xl">
                  <Star fill="#FFD700" stroke="#FFD700" />
                  <div>
                    <span>{(data.rating / 10).toFixed(1)}</span>
                    <span>/10</span>
                  </div>
                </span>
                <span className="text-xs">
                  <a
                    target="_blank"
                    className="hover:text-[#9047FE] transition-all"
                    href={`${data.url}`}
                  >
                    IGDB Rating
                  </a>
                </span>
              </div>
              <div className="h-12 w-px bg-base-300" />

              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-2 text-xl">
                  {data.aggregated_rating.toFixed(0)}
                </span>
                <span className="text-xs">Metascore</span>
              </div>
            </div>

            <div className="flex flex-row gap-4 ">
              <button className="btn btn-primary btn-md ">
                <Heart />
                Favorite
              </button>

              <button className="btn btn-secondary">
                <ListPlus />
                Add to List
              </button>

              <button className="btn btn-info">
                <ListPlus />
                Write a Reivew
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${trailer?.video_id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
