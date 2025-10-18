import StoreIcons from "@/components/storeIcons/StoreIcons";

interface Website {
  id: number;
  url: string;
  type: {
    id: number;
  };
}

type Props = {
  data: Website[];
};

const STORE_TYPE_IDS: Record<number, string> = {
  10: "App Store", // iOS
  11: "App Store", // iPad
  12: "Google Play",
  13: "Steam",
  14: "Reddit",
  15: "Itch.io",
  16: "Epic",
  17: "GOG",
  22: "Xbox",
  23: "PlayStation",
  24: "Nintendo",
};

const STORE_IDS = [10, 11, 12, 13, 16, 17, 22, 23, 24];

const GamePageStores = ({ data }: Props) => {
  // Filter to only store links
  const storeLinks = data.filter((website) =>
    STORE_IDS.includes(website.type.id)
  );

  if (storeLinks.length === 0) {
    return null;
  }

  // Convert to store objects
  const stores = storeLinks.map((website) => ({
    id: website.type.id,
    url: website.url,
    displayName: STORE_TYPE_IDS[website.type.id] || "Store",
  }));

  // Filter out duplicate App Store entries
  const processedStores = stores.reduce(
    (acc, store) => {
      if (store.id === 11 && acc.some((s) => s.id === 10)) {
        return acc;
      }
      if (store.id === 10 && acc.some((s) => s.id === 11)) {
        return acc;
      }
      return [...acc, store];
    },
    [] as typeof stores
  );

  return (
    <>
      <h2 className="text-lg font-bold">Stores</h2>
      <div className="grid grid-cols-2 gap-4">
        {processedStores
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map((store, index) => (
            <a
              className="group self-start relative items-center justify-center btn px-8 gap-4"
              key={`${store.id}-${index}`}
              target="_blank"
              href={store.url}
              rel="noopener noreferrer"
            >
              <StoreIcons storeType={store.displayName.toLowerCase()} />
              <span className="duration-200 group-hover:opacity-50 text-xs md:text-base">
                {store.displayName}
              </span>
            </a>
          ))}
      </div>
    </>
  );
};

export default GamePageStores;
