import type { Game } from "../../Interface";
import StoreIcons from "../../components/StoreIcons";

type Props = {
  data: Game;
};

const STORE_DISPLAY_NAMES: Record<string, string> = {
  "10": "App Store", // iOS
  "11": "App Store", // iPad
  "12": "Google Play",
  "13": "Steam",
  "16": "Epic",
  "17": "GOG",
  "22": "Xbox",
  "23": "PlayStation",
  "24": "Nintendo",
};

const GamePageStores = ({ data }: Props) => {
  if (!data.store_links || Object.keys(data.store_links).length === 0) {
    return null;
  }

  // Convert store_links object to array
  const stores = Object.entries(data.store_links).map(([storeId, url]) => ({
    id: parseInt(storeId),
    url: url,
    displayName: STORE_DISPLAY_NAMES[storeId] || "Store",
  }));

  // Filter out duplicate App Store entries (keep only one if both iOS and iPad exist)
  const processedStores = stores.reduce(
    (acc, store) => {
      // Skip iPad (11) if iPhone (10) already exists
      if (store.id === 11 && acc.some((s) => s.id === 10)) {
        return acc;
      }
      // Skip iPhone (10) if iPad (11) already exists
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
          .map((store) => (
            <a
              className="group self-start relative items-center justify-center btn px-8 gap-4"
              key={store.id}
              target="_blank"
              href={store.url}
            >
              <StoreIcons storeType={store.displayName.toLowerCase()} />
              <span className="text-xs md:text-base">{store.displayName}</span>
            </a>
          ))}
      </div>
    </>
  );
};

export default GamePageStores;
