'use client';

interface RevenueChartProps {
    data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) return null;

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h3>

            <div className="flex items-end gap-2 h-48">
                {data.map((item, index) => {
                    const height = (item.revenue / maxRevenue) * 100;
                    const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            {/* Value label */}
                            <span className="text-xs text-gray-500 font-medium">
                                ${item.revenue.toFixed(0)}
                            </span>

                            {/* Bar */}
                            <div className="w-full flex items-end" style={{ height: '160px' }}>
                                <div
                                    className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-t-md transition-all duration-500 ease-out hover:from-orange-600 hover:to-red-500 cursor-pointer min-h-[4px]"
                                    style={{ height: `${Math.max(height, 3)}%` }}
                                    title={`$${item.revenue.toFixed(2)}`}
                                />
                            </div>

                            {/* Day label */}
                            <span className="text-xs text-gray-400 font-medium">{dayName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
