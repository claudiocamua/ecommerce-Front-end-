export default function SkeletonHorizontal() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="
            min-w-[220px] sm:min-w-[260px] lg:min-w-[300px]
            bg-white rounded-xl shadow
            animate-pulse
          "
        >
          <div className="aspect-square bg-gray-300 rounded-t-xl" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-5 bg-gray-300 rounded w-1/2 mt-3" />
            <div className="h-8 bg-gray-300 rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
