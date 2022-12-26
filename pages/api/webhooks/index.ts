import { STRIPE_WEBHOOK_SECRET } from '@lib/config';
import { stripe } from '@lib/stripe';
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'] as string;

        let event;

        try {
            event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            return;
        }

        switch (event.type) {
            case 'customer.created':
                {
                    const customer = event.data.object as Stripe.Customer;
                    console.log(`Customer created: ${customer.email}`);
                }
                break;
            case 'customer.subscription.created':
                {
                    const subscription = event.data.object as Stripe.Subscription;
                    console.log(`Subscription created: ${subscription.id}`);
                }
                break;
            case 'customer.subscription.updated':
                {
                    const subscription = event.data.object as Stripe.Subscription;
                    console.log(`Subscription updated: ${subscription.id}`);
                }
                break;
            case 'customer.subscription.deleted':
                {
                    const subscription = event.data.object as Stripe.Subscription;
                    console.log(`Subscription deleted: ${subscription.id}`);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export default handler;
