import React, { useEffect, useRef, useState } from "react";

type Screenshot = {
  id: number;
  image_id: string;
};

type LightboxGalleryProps = {
  screenshots: Screenshot[];
};

const LightboxGallery: React.FC<LightboxGalleryProps> = ({ screenshots }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbnailRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const el = thumbnailRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  return (
    <>
      {/* Grid Preview */}
      <div className="grid grid-cols-2 gap-4">
        {screenshots.slice(0, 3).map((screenshot, idx) => (
          <img
            key={screenshot.id}
            src={`https://images.igdb.com/igdb/image/upload/t_1080p/${screenshot}.jpg`}
            className="col-span-1 cursor-pointer rounded shadow-md hover:scale-105 transition-transform"
            onClick={() => openModal(idx)}
          />
        ))}

        {screenshots.length > 3 && (
          <div
            className="relative col-span-1 cursor-pointer rounded overflow-hidden hover:scale-105 transition-transform"
            onClick={() => openModal(3)}
          >
            <img
              src={`https://images.igdb.com/igdb/image/upload/t_1080p/${screenshots[3]}.jpg`}
              className="w-full h-full object-cover blur-sm brightness-50"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
              +{screenshots.length - 3} more
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isOpen && (
        <dialog
          className="modal modal-open backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-box w-full max-w-7xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}

            {/* Main Image Display */}
            <div className="relative w-full flex justify-center items-center">
              <button
                onClick={prevImage}
                className="absolute left-0 z-10 btn btn-circle m-4"
              >
                ❮
              </button>

              <img
                src={`https://images.igdb.com/igdb/image/upload/t_1080p/${screenshots[selectedIndex]}.jpg`}
                className="max-h-[70vh] object-contain rounded"
              />

              <button
                onClick={nextImage}
                className="absolute right-0 z-10 btn btn-circle m-4"
              >
                ❯
              </button>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 overflow-x-auto w-fit mx-auto max-w-full">
              <div className="flex gap-2 px-2">
                {screenshots.map((screenshot, idx) => (
                  <img
                    key={screenshot.id}
                    ref={(el) => {
                      thumbnailRefs.current[idx] = el;
                    }}
                    src={`https://images.igdb.com/igdb/image/upload/t_thumb/${screenshot}.jpg`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      idx === selectedIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default LightboxGallery;
