import HighlyRated from "./HighlyRated";
import LandingFeatures from "./LandingFeatures";

export default function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Gaming Journey
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Rate, review, and discover video games. Build your gaming
                    profile and connect with other players who share your taste.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <button className="px-8 btn btn-primary hover:btn-secondary btn-xs sm:btn-sm md:btn-md">
                    Get Started
                  </button>
                  <a
                    href="#features"
                    className="px-8 btn btn-neutral hover:btn-accent btn-xs sm:btn-sm md:btn-md "
                  >
                    Learn More
                  </a>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <div className="relative h-[350px] w-[300px] sm:h-[450px] sm:w-[400px] lg:h-[500px] lg:w-[450px]">
                  <div className="absolute top-0 left-0 h-[80%] w-[80%] rotate-[-6deg] rounded-lg overflow-hidden shadow-xl ">
                    <img
                      src="/images/cyberpunk.png?height=400&width=300"
                      alt="Cyberpunk 2077"
                      width={300}
                      height={400}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 h-[80%] w-[80%] rotate-[6deg] rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="/images/stray.png?height=400&width=300"
                      alt="Stray"
                      width={300}
                      height={400}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highly Rated Games */}
        <section
          id="highly-rated-games"
          className="w-full py-6 md:py-12 lg:py-24 bg-background"
        >
          <HighlyRated />
        </section>

        {/* Features Section */}
        <LandingFeatures />

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to start tracking?
                </h2>
                <p className="mx-auto max-w-[400px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Keep your play history organized, clear, and always within
                  reach.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                  <button className="btn btn-primary hover:btn-secondary px-8">
                    Sign Up Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
