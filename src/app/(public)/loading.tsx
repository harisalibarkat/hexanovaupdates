export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        <div className="lg:col-span-3">
          <div className="skeleton aspect-[4/3] w-full mb-4" />
          <div className="skeleton h-4 w-20 mb-3" />
          <div className="skeleton h-8 w-full mb-2" />
          <div className="skeleton h-8 w-3/4 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-5/6" />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton w-28 h-20 flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3 w-16 mb-2" />
                <div className="skeleton h-4 w-full mb-1" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section heading */}
      <div className="skeleton h-6 w-36 mb-2" />
      <div className="skeleton h-1 w-10 mb-8" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/3] w-full mb-3" />
            <div className="skeleton h-3 w-16 mb-2" />
            <div className="skeleton h-5 w-full mb-1" />
            <div className="skeleton h-5 w-4/5 mb-3" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
