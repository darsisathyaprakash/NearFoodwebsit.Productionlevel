import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { signupSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = signupSchema.parse(body);
        const { email, password } = validated;

        const { data, error } = await insforge.auth.signUp({
            email,
            password,
        });

        if (error) {
            // Generic error message to prevent user enumeration
            return NextResponse.json(
                { error: 'Unable to create account. Please try again.' },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'An error occurred during signup' },
            { status: 500 }
        );
    }
}
