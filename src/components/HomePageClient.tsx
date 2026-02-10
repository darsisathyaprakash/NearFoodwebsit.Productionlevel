'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight,
    MapPin,
    Clock,
    Utensils,
    Star,
    ShieldCheck,
    Truck,
    Heart,
    ChevronRight,
    Sparkles,
    Flame,
    Zap
} from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
    gradient?: string;
}

function FeatureCard({ icon, title, description, delay = 0, gradient = 'from-orange-500 to-red-500' }: FeatureCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <motion.div
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                        rotate: isHovered ? 5 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`h-16 w-16 bg-gradient-to-br ${gradient} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                    {icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

interface RestaurantCardProps {
    restaurant: {
        id: string;
        name: string;
        image_url?: string;
        cuisine?: string;
        rating?: number;
    };
    index: number;
}

function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link
                href={`/restaurants/${restaurant.id}`}
                className="group block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
                        <motion.img
                            src={restaurant.image_url || `https://placehold.co/600x450?text=${encodeURIComponent(restaurant.name)}`}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900">{restaurant.rating || '4.5'}</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
                        <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                                {restaurant.cuisine || 'Multi-cuisine'}
                            </span>
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                25-35 min
                            </span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                Free delivery
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

interface StatCardProps {
    value: string;
    label: string;
    icon: React.ReactNode;
    delay: number;
}

function StatCard({ value, label, icon, delay }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="text-center"
        >
            <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl mb-4 shadow-lg">
                {icon}
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2"
            >
                {value}
            </motion.div>
            <p className="text-gray-600 font-medium">{label}</p>
        </motion.div>
    );
}

interface StepCardProps {
    step: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    delay: number;
}

function StepCard({ step, title, description, icon, delay }: StepCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="relative"
        >
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                <div className="absolute -top-4 -left-4 h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                    {step}
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 mt-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

interface HomePageClientProps {
    featuredRestaurants: Array<{
        id: string;
        name: string;
        image_url?: string;
        cuisine?: string;
        rating?: number;
    }>;
}

export function HomePageClient({ featuredRestaurants }: HomePageClientProps) {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-orange-600">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                {/* Floating food elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-10 text-white/20 text-8xl"
                >
                    🍕
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-40 right-20 text-white/20 text-7xl"
                >
                    🍔
                </motion.div>
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-40 left-20 text-white/20 text-6xl"
                >
                    🍜
                </motion.div>
                <motion.div
                    animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-10 text-white/20 text-8xl"
                >
                    🍣
                </motion.div>

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

                {/* Hero Content */}
                <div className="relative z-10 container px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full mb-8"
                    >
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <span className="text-white font-medium">Order now and get 20% off your first order!</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 text-white"
                    >
                        Delicious Food,
                        <br />
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                                Delivered Fast
                            </span>
                            <motion.div
                                className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-300/50 rounded-full blur-sm"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90 font-light"
                    >
                        Discover thousands of restaurants near you. Fresh, hot, and delivered to your doorstep in minutes.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            href="/restaurants"
                            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full bg-white text-orange-600 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-orange-300/50 active:scale-95"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-3">
                                <Flame className="h-6 w-6" />
                                Find Food Near You
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <Link
                            href="/restaurants"
                            className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                        >
                            <span className="flex items-center gap-3">
                                <Zap className="h-6 w-6" />
                                View All Restaurants
                            </span>
                        </Link>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 flex flex-wrap justify-center gap-6"
                    >
                        <div className="flex items-center gap-2 text-white/80">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-medium">100% Secure</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Truck className="h-5 w-5" />
                            <span className="font-medium">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Heart className="h-5 w-5" />
                            <span className="font-medium">Customer Love</span>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="py-16 bg-white">
                <div className="container px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard
                            value="10K+"
                            label="Happy Customers"
                            icon={<Heart className="h-8 w-8" />}
                            delay={0}
                        />
                        <StatCard
                            value="500+"
                            label="Restaurants"
                            icon={<Utensils className="h-8 w-8" />}
                            delay={0.1}
                        />
                        <StatCard
                            value="50K+"
                            label="Orders Delivered"
                            icon={<Truck className="h-8 w-8" />}
                            delay={0.2}
                        />
                        <StatCard
                            value="4.9"
                            label="Average Rating"
                            icon={<Star className="h-8 w-8" />}
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                            WHY CHOOSE US
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            The{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                NearFood
                            </span>{' '}
                            Difference
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We're not just another food delivery app. We're your personal food concierge.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<MapPin className="h-8 w-8" />}
                            title="Live GPS Tracking"
                            description="Track your order in real-time from the restaurant to your doorstep. Know exactly when your food will arrive."
                            delay={0}
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={<Clock className="h-8 w-8" />}
                            title="Lightning Fast Delivery"
                            description="Our optimized delivery network ensures your food arrives hot and fresh, typically within 30 minutes."
                            delay={0.1}
                            gradient="from-orange-500 to-red-500"
                        />
                        <FeatureCard
                            icon={<Utensils className="h-8 w-8" />}
                            title="Curated Restaurants"
                            description="Hand-picked selection of the best local restaurants, all verified for quality and hygiene standards."
                            delay={0.2}
                            gradient="from-purple-500 to-pink-500"
                        />
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 bg-gray-50">
                <div className="container px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                            SIMPLE PROCESS
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            How It{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get your favorite food delivered in just 3 simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <StepCard
                            step={1}
                            title="Browse & Choose"
                            description="Explore hundreds of restaurants and cuisines. Filter by rating, delivery time, or your favorite dishes."
                            icon={<Utensils className="h-7 w-7" />}
                            delay={0}
                        />
                        <StepCard
                            step={2}
                            title="Place Your Order"
                            description="Add items to your cart, customize your order, and checkout securely with multiple payment options."
                            icon={<Heart className="h-7 w-7" />}
                            delay={0.1}
                        />
                        <StepCard
                            step={3}
                            title="Enjoy Your Meal"
                            description="Track your delivery in real-time and receive your food hot and fresh at your doorstep."
                            icon={<Truck className="h-7 w-7" />}
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* ===== FEATURED RESTAURANTS ===== */}
            {featuredRestaurants && featuredRestaurants.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="container px-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                                    FEATURED
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                                    Popular{' '}
                                    <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                        Restaurants
                                    </span>
                                </h2>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    href="/restaurants"
                                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-orange-300/50 transition-all duration-300"
                                >
                                    View All Restaurants
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredRestaurants.map((restaurant, index) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CTA SECTION ===== */}
            <section className="py-24 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                <div className="container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
                            Ready to Order?
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 text-white/90 font-light">
                            Join thousands of happy customers and get your favorite food delivered today.
                        </p>
                        <Link
                            href="/restaurants"
                            className="group inline-flex items-center justify-center px-12 py-5 text-xl font-bold rounded-full bg-white text-orange-600 shadow-2xl hover:scale-105 hover:shadow-orange-300/50 transition-all duration-300"
                        >
                            <span className="flex items-center gap-3">
                                <Flame className="h-6 w-6" />
                                Start Ordering Now
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

export default HomePageClient;
