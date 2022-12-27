import { is_logged_in } from '@lib/auth';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { stripe } from '@lib/stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CartItem } from 'stores/cart.store';
import Stripe from 'stripe';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!(await is_logged_in(req))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { cart }: { cart: CartItem[] } = req.body;
    const userId = req.session.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    const plugins = await prisma.plugin.findMany({
        where: {
            id: {
                in: cart.filter(item => item.type === 'PLUGIN').map(item => item.itemId),
            },
        },
    });

    const bundles = await prisma.subscriptionTemplate.findMany({
        where: {
            id: {
                in: cart.filter(item => item.type === 'BUNDLE').map(item => item.itemId),
            },
        },
        include: {
            plugins: true,
        },
    });

    const products = await Promise.all(
        plugins
            .map(plugin => {
                return {
                    id: plugin.stripeProductId,
                };
            })
            .concat(
                bundles.map(bundle => {
                    return {
                        id: bundle.stripeProductId,
                    };
                })
            )
            .map(async product => {
                return await stripe.products.retrieve(product.id, {
                    expand: ['default_price'],
                });
            })
    );

    const all_plugins = plugins.concat(bundles.flatMap(bundle => bundle.plugins));

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId ?? (await stripe.customers.create({ email: user.email })).id,
        items: products.map(product => {
            return {
                price: (product.default_price as Stripe.Price).id,
            };
        }),
        metadata: {
            userId: user.id,
            plugins: JSON.stringify(all_plugins.map(plugin => plugin.id)),
            subscriptionTemplateIds: JSON.stringify(bundles.map(bundle => bundle.id)),
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription', payment_method_types: ['card', 'link'] },
        expand: ['latest_invoice.payment_intent'],
        currency: 'USD',
    });

    return res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
            .client_secret,
    });
}

export default withSessionRoute(handler);
