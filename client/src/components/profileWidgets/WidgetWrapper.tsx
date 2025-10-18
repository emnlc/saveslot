// components/ProfileWidgets/WidgetWrapper.tsx
import { ReactNode } from "react";

interface Props {
  enabled: boolean;
  children: ReactNode;
}

const WidgetWrapper = ({ enabled, children }: Props) => {
  if (!enabled) return null;
  return <>{children}</>;
};

export default WidgetWrapper;
