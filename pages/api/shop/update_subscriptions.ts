import { stripe } from '@lib/stripe';
import { Product } from '@lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { subscriptionId, cart }: { subscriptionId: string; cart: Product[] } = JSON.parse(req.body);

    const subscription = await stripe.subscriptions.update(subscriptionId, {
        items: cart.map(product => {
            return {
                price: product.price.id,
            };
        }),
    });

    return res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
            .client_secret,
    });
}
