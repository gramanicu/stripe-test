import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

export const permissions_list = [
    'pokémon:owned:list',
    'pokémon:owned:add',
    'pokémon:owned:remove',
    'pokémon:list',
    'pokémon:add-page',
    'pokémon:view_count',
] as const;

export type PermissionTypes = typeof permissions_list[number];

export const STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY || '';
const prisma = new PrismaClient();
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
});

async function main() {
    // Check defined permissions and update the database
    await prisma.$transaction([
        prisma.permission.deleteMany(),
        prisma.permission.createMany({
            data: permissions_list.map(permission => {
                return {
                    name: permission,
                };
            }),
            skipDuplicates: true,
        }),
    ]);

    // Add test data
    const base_permissions: PermissionTypes[] = [
        'pokémon:owned:add',
        'pokémon:owned:list',
        'pokémon:owned:remove',
        'pokémon:list',
    ];

    const base_product = await stripe.products.create({
        name: 'Base Subscription',
        description: 'The base subscription for the application',
        default_price_data: {
            currency: 'USD',
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
            unit_amount: 1000,
        },
    });
    await prisma.plugin.create({
        data: {
            name: base_product.name,
            description: base_product.description || '',
            stripeProductId: base_product.id,
            permissions: {
                connect: base_permissions.map(permission => {
                    return { name: permission };
                }),
            },
        },
    });

    const gold_permissions: PermissionTypes[] = [...base_permissions, 'pokémon:add-page'];
    const gold_product = await stripe.products.create({
        name: 'Gold Subscription',
        description: 'Your limits are higher and you can request the application to add more pokémon',
        default_price_data: {
            currency: 'USD',
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
            unit_amount: 3000,
        },
    });
    await prisma.plugin.create({
        data: {
            name: gold_product.name,
            description: gold_product.description || '',
            stripeProductId: gold_product.id,
            permissions: {
                connect: gold_permissions.map(permission => {
                    return { name: permission };
                }),
            },
        },
    });

    const simple_plugin_permission: PermissionTypes[] = ['pokémon:view_count'];
    const simple_plugin_product = await stripe.products.create({
        name: 'View pokémon count',
        description: 'You can view the application`s pokémon count',
        default_price_data: {
            currency: 'USD',
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
            unit_amount: 100,
        },
    });
    await prisma.plugin.create({
        data: {
            name: simple_plugin_product.name,
            description: simple_plugin_product.description || '',
            stripeProductId: simple_plugin_product.id,
            permissions: {
                connect: simple_plugin_permission.map(permission => {
                    return { name: permission };
                }),
            },
        },
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
