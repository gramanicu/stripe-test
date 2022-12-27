import { STRIPE_WEBHOOK_SECRET } from '@lib/config';
import { SubscriptionService } from '@lib/services/subscription.service';
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

                    console.log(`Created subscription for ${subscription.metadata.userId}`);
                }
                break;
            case 'customer.subscription.updated':
                {
                    const subscription = event.data.object as Stripe.Subscription;

                    if (subscription.status === 'active' && subscription.metadata.isStored != 'true') {
                        const new_subscription = await SubscriptionService.create(
                            subscription.metadata.userId,
                            JSON.parse(subscription.metadata.plugins),
                            subscription.id,
                            JSON.parse(subscription.metadata.subscriptionTemplateIds)
                        );

                        await stripe.subscriptions.update(subscription.id, {
                            metadata: {
                                isStored: 'true',
                                subscriptionId: new_subscription.id,
                            },
                        });

                        console.log(`Updated subscription for ${subscription.metadata.userId}`);
                    }
                }
                break;
            case 'customer.subscription.deleted':
                {
                    const subscription = event.data.object as Stripe.Subscription;

                    await SubscriptionService.remove(subscription.metadata.subscriptionId);

                    console.log(`Deleted subscription for ${subscription.metadata.userId}`);
                }
                break;
            default: {
                // console.log(`Unhandled event type ${event.type}`);
            }
        }

        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export default handler;
