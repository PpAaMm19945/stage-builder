import { cors } from 'hono/cors';
import { Env } from '../types';

export const corsMiddleware = cors({
    origin: (origin, c) => {
        const frontendUrl = c.env.FRONTEND_URL || 'https://stage-builder-9hh.pages.dev';
        const allowedOrigins = [
            frontendUrl,
            'https://stage-builder-9hh.pages.dev',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8080',
        ];

        if (origin && (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.lovable.app') ||
            origin.endsWith('.lovableproject.com') ||
            origin.endsWith('.pages.dev') ||
            origin.endsWith('.workers.dev')
        )) {
            return origin;
        }

        // Return default instead of undefined
        return frontendUrl;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
});
