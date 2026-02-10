import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { createPaymentOrderSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

// Stripe secret key (optional — if not set, we run in dummy mode)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate request body
        const body = await request.json();
        const validated = createPaymentOrderSchema.parse(body);
        const { amount, currency = 'USD' } = validated;

        // ─── Dummy Mode (no Stripe key configured) ───
        if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_dummy') {
            console.log('Payment API running in Dummy Mode');
            const dummySession = {
                id: `dummy_session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                amount: Math.round(amount * 100),
                currency,
                mode: 'dummy',
            };
            return NextResponse.json(dummySession);
        }

        // ─── Real Stripe Mode ───
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY);

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: 'NearFood Order',
                            description: 'Food delivery order',
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            customer_email: sessionData.session.user.email || undefined,
            metadata: {
                user_id: sessionData.session.user.id,
            },
        });

        return NextResponse.json({
            id: session.id,
            url: session.url,
            mode: 'live',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Stripe session creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment session' },
            { status: 500 }
        );
    }
}
