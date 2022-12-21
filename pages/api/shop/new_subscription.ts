import { prisma } from '@lib/db';
import { stripe } from '@lib/stripe';
import { Product } from '@lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email, cart }: { email: string; cart: Product[] } = JSON.parse(req.body);

    const user = await prisma.user.findFirst({
        where: {
            email,
        },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: cart.map(product => {
            return {
                price: product.price.id,
            };
        }),
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription', payment_method_types: ['card'] },
        expand: ['latest_invoice.payment_intent'],
        currency: 'USD',
    });

    return res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
            .client_secret,
    });
}
