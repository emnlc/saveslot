type Props = { count?: number };

const LoadingSkeleton = ({ count = 3 }: Props) => {
  return (
    <div className="col-span-1 md:col-span-2">
      <h1 className="text-xl font-bold mb-6">Reviews</h1>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse bg-base-200 rounded-lg h-48" />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
