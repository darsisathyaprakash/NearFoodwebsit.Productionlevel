'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: number; // percentage change
    color?: 'orange' | 'blue' | 'green' | 'purple';
}

const colorMap = {
    orange: {
        bg: 'bg-orange-50',
        icon: 'bg-gradient-to-br from-orange-500 to-red-500',
        shadow: 'shadow-orange-500/20',
    },
    blue: {
        bg: 'bg-blue-50',
        icon: 'bg-gradient-to-br from-blue-500 to-indigo-500',
        shadow: 'shadow-blue-500/20',
    },
    green: {
        bg: 'bg-emerald-50',
        icon: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        shadow: 'shadow-emerald-500/20',
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'bg-gradient-to-br from-purple-500 to-pink-500',
        shadow: 'shadow-purple-500/20',
    },
};

export function StatsCard({ title, value, icon, trend, color = 'orange' }: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>{Math.abs(trend)}% from last week</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors.icon} ${colors.shadow} shadow-lg`}>
                    <div className="text-white">{icon}</div>
                </div>
            </div>
        </div>
    );
}
