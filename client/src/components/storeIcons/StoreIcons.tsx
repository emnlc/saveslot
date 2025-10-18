import AppStore from "./AppStore";
import Epic from "./Epic";
import GOG from "./GOG";
import Nintendo from "./Nintendo";
import PlayStation from "./PlayStation";
import PlayStore from "./PlayStore";
import Steam from "./Steam";
import Xbox from "./Xbox";

import { Globe } from "lucide-react";

type Props = {
  storeType: string;
};

const StoreIcons = ({ storeType }: Props) => {
  const classes =
    "w-6 h-6 object-contain transition-opacity duration-200 group-hover:opacity-50";
  const icons: Record<string, React.ReactElement> = {
    steam: <Steam classes={classes} />,
    xbox: <Xbox classes={classes} />,
    epic: <Epic classes={classes} />,
    gog: <GOG classes={classes} />,
    nintendo: <Nintendo classes={classes} />,
    playstation: <PlayStation classes={classes} />,
    "google play": <PlayStore classes={classes} />,
    "app store": <AppStore classes={classes} />,
  };

  return icons[storeType] || <Globe />;
};

export default StoreIcons;
