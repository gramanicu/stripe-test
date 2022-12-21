import Stripe from 'stripe';

export type Product = {
    id: string;
    name: string;
    description: string;
    price: Stripe.Price;
};
