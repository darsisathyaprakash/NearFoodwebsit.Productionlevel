// API route error handler wrapper
// Reduces boilerplate try/catch in every route handler
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

type RouteHandler = (
    request: NextRequest,
    context?: { params: Promise<{ id: string }> }
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with consistent error handling.
 * Catches ZodError for validation and all other errors for 500s.
 */
export function withErrorHandler(handler: RouteHandler, routeName: string): RouteHandler {
    return async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
        try {
            return await handler(request, context);
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json(
                    { success: false, error: error.issues[0].message },
                    { status: 400 }
                );
            }

            logger.error(`Unhandled error in ${routeName}`, error, {
                method: request.method,
                url: request.url,
            });

            return NextResponse.json(
                { success: false, error: 'An internal error occurred' },
                { status: 500 }
            );
        }
    };
}
