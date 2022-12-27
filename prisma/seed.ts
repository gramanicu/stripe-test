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

async function create_plugin(name: string, description: string, price: number, permissions: PermissionTypes[]) {
    const product = await stripe.products.create({
        name: name,

        description: description,
        default_price_data: {
            currency: 'USD',
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
            unit_amount: price,
        },
    });

    const plugin = await prisma.plugin.create({
        data: {
            name: product.name,
            description: product.description || '',
            permissions: {
                connect: permissions.map(permission => {
                    return { name: permission };
                }),
            },
            stripeProductId: product.id,
            price: price / 100,
        },
    });

    return plugin;
}

async function create_subscription(name: string, description: string, price: number, plugins: string[]) {
    const exists = await stripe.products.search({
        query: `name:"${name}"`,
    });

    let product: Stripe.Product;

    if (exists.data.length === 0) {
        product = await stripe.products.create({
            name: name,
            description: description,
            default_price_data: {
                currency: 'USD',
                recurring: {
                    interval: 'month',
                    interval_count: 1,
                },
                unit_amount: price,
            },
        });
    } else {
        product = exists.data[0];
    }

    const plugin = await prisma.subscriptionTemplate.create({
        data: {
            name: product.name,
            description: product.description || '',
            plugins: {
                connect: plugins.map(plugin => {
                    return { id: plugin };
                }),
            },
            stripeProductId: product.id,
            price: price / 100,
        },
    });

    return plugin;
}

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
    const gold_permissions: PermissionTypes[] = ['pokémon:list', 'pokémon:add-page'];
    const view_count_permissions: PermissionTypes[] = ['pokémon:list', 'pokémon:view_count'];

    const base_plugin = await create_plugin(
        'Base Subscription',
        'The base subscription for the application',
        1500,
        base_permissions
    );

    const gold_product = await create_plugin(
        'Add pokémon page',
        'You can add a pokémon page to the application',
        1000,
        gold_permissions
    );

    await create_plugin(
        'View pokémon count',
        'You can view the application`s pokémon count',
        500,
        view_count_permissions
    );

    await create_subscription('Base Tier', 'The base tier for the application', 1000, [base_plugin.id]);
    await create_subscription('Gold Tier', 'The gold tier for the application', 1750, [
        base_plugin.id,
        gold_product.id,
    ]);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
