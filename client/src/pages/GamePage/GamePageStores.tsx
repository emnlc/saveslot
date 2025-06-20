import type { Game } from "../../Interface";
import StoreIcons from "../../components/StoreIcons";

type Props = {
  data: Game;
};

const STORE_IDS = new Set<number>([10, 11, 12, 13, 16, 17, 22, 23, 24]);

const GamePageStores = ({ data }: Props) => {
  const stores =
    data.websites &&
    data.websites.filter(
      (website) => website.type && STORE_IDS.has(website.type.id)
    );

  const processedStores = stores?.reduce(
    (acc, store) => {
      // skip ipad if iphone seen
      if (store.type.id === 11 && acc.some((s) => s.type.id === 10)) {
        return acc;
      }
      // skip iphone if ipad seen
      if (store.type.id === 10 && acc.some((s) => s.type.id === 11)) {
        return acc;
      }

      // change name
      let displayName = store.type.type;
      if ([10, 11].includes(store.type.id)) {
        displayName = "App Store";
      } else if (store.type.id === 23) {
        // ps store
        displayName = "PlayStation";
      }

      return [...acc, { ...store, displayName }];
    },
    [] as Array<(typeof stores)[0] & { displayName: string }>
  );

  return (
    <>
      {processedStores && processedStores.length > 0 && (
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
                  <span className="text-xs md:text-base">
                    {store.displayName}
                  </span>
                </a>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default GamePageStores;
