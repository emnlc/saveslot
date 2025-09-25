const ErrorState = () => {
  return (
    <div className="col-span-1 md:col-span-2">
      <h1 className="text-xl font-bold mb-6">Reviews</h1>
      <div className="alert alert-error">
        <span>Failed to load reviews. Please try again.</span>
      </div>
    </div>
  );
};

export default ErrorState;
