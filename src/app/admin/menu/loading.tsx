export default function AdminMenuLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-[250px] flex-shrink-0" />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-16 border-b border-gray-100 bg-white" />
                <main className="flex-1 p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-48" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                                    <div className="h-32 bg-gray-200 rounded-lg" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
