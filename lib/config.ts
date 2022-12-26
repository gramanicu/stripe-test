export const PORT: number = parseInt(process.env.PORT || '3000');
export const DOMAIN: string = process.env.DOMAIN || `localhost:${PORT}`;

export const AUTH_SECRET: string = process.env.AUTH_SECRET || '';
export const STRIPE_PUBLISHABLE_KEY: string = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET: string = process.env.STRIPE_WEBHOOK_SECRET || '';
