import { ListChecks, Star, Users } from "lucide-react";

const LandingFeatures = () => {
  return (
    <>
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-background"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Features You'll Love
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to track your gaming experience and connect
                with other gamers.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Track Your Games</h3>
              <p className="text-center text-muted-foreground">
                Log games you've played, want to play, and are currently
                playing. Build your gaming history.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Rate & Review</h3>
              <p className="text-center text-muted-foreground">
                Share your thoughts and rate games on a five-star scale. Write
                detailed reviews of your gaming experiences.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border border-base-300 bg-base-200 p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Connect</h3>
              <p className="text-center text-muted-foreground">
                Follow friends and gamers with similar tastes. Discover new
                games through personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingFeatures;
