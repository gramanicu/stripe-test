import Stripe from 'stripe';

import { STRIPE_SECRET_KEY } from './config';

declare global {
    // eslint-disable-next-line no-var
    var stripe: Stripe | undefined;
}

export const stripe =
    global.stripe ||
    new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
    });

if (process.env.NODE_ENV !== 'production') global.stripe = stripe;
