import AppStore from "./storeIcons/AppStore";
import Epic from "./storeIcons/Epic";
import GOG from "./storeIcons/GOG";
import Nintendo from "./storeIcons/Nintendo";
import PlayStation from "./storeIcons/PlayStation";
import PlayStore from "./storeIcons/PlayStore";
import Steam from "./storeIcons/Steam";
import Xbox from "./storeIcons/Xbox";

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
