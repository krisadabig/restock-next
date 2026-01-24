
export function SkeletonList() {
    return (
        <div className="space-y-3 pb-32 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass card-gradient p-4 rounded-3xl border border-white/5 dark:border-white/5 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700/50 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700/50 rounded-xl"></div>
                </div>
            ))}
        </div>
    );
}
