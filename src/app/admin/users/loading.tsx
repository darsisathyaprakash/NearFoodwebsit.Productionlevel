export default function AdminUsersLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-[250px] flex-shrink-0" />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-16 border-b border-gray-100 bg-white" />
                <main className="flex-1 p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-100 rounded w-56" />
                        <div className="mt-6 space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-40" />
                                        <div className="h-3 bg-gray-100 rounded w-56" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
