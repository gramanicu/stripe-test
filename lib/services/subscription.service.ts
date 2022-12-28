import { prisma } from '@lib/db';
import { Prisma, Subscription } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

async function create(
    userId: string,
    pluginIds: string[],
    stripeSubscriptionId: string,
    subscriptionTemplateIds?: string[]
): Promise<Subscription> {
    try {
        let subscription: Subscription;
        if (subscriptionTemplateIds && subscriptionTemplateIds.length > 0) {
            subscription = await prisma.subscription.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    plugins: {
                        connect: pluginIds.map(id => ({ id })),
                    },
                    stripeSubscriptionId,
                    subscriptionTemplate: subscriptionTemplateIds && {
                        connect: {
                            id: subscriptionTemplateIds[0],
                        },
                    },
                },
            });
        } else {
            subscription = await prisma.subscription.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    plugins: {
                        connect: pluginIds.map(id => ({ id })),
                    },
                    stripeSubscriptionId,
                },
            });
        }

        if (!subscription) {
            throw new Error('Subscription could not be created');
        }

        return subscription;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    throw new Error('Subscription already exists');
                case 'P2003':
                    throw new Error('Plugin not found');
                default:
                    throw new Error('Internal server error');
            }
        }

        throw new Error('Internal server error');
    }
}

async function update(subscriptionId: string, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
    try {
        const subscription = await prisma.subscription.update({
            where: {
                id: subscriptionId,
            },
            data: data,
        });

        return subscription;
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    throw new Error('Subscription does not exist');
                default:
                    throw new Error('Internal server error');
            }
        }

        throw new Error('Internal server error');
    }
}

async function remove(subscriptionId: string): Promise<Subscription> {
    try {
        const subscription = await prisma.subscription.delete({
            where: {
                id: subscriptionId,
            },
        });

        return subscription;
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    throw new Error('Subscription does not exist');
                default:
                    throw new Error('Internal server error');
            }
        }

        throw new Error('Internal server error');
    }
}

export const SubscriptionService = {
    create,
    update,
    remove,
};
