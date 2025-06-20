import type { Game } from "../../Interface";

type Props = {
  data: Game;
};

const GamePageTrailer = ({ data }: Props) => {
  let trailer = null;

  const trailerVideos = data.videos.filter(
    (video) => video.name && video.name.trim().toLowerCase() === "trailer"
  );
  if (trailerVideos.length > 0) {
    trailer = trailerVideos[0];
  }

  if (!trailer) {
    const fallbackKeywords = [
      "launch",
      "release",
      "cinematic",
      "story",
      "trailer",
    ];
    for (const keyword of fallbackKeywords) {
      trailer = data.videos.find(
        (video) => video.name && video.name.toLowerCase().includes(keyword)
      );
      if (trailer) break;
    }
  }

  return (
    <>
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          className="w-full h-full "
          src={`https://www.youtube.com/embed/${trailer?.video_id}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </>
  );
};

export default GamePageTrailer;
