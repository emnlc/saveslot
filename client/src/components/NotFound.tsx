import { useNavigate } from "@tanstack/react-router";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="flex flex-col text-center gap-6 max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-sm text-base-content/60">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate({ to: "/" })}
            className="btn btn-primary gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn btn-soft gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
