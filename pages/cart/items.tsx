import SimpleButton from '@components/buttons/SimpleButton';
import SimpleCheckbox from '@components/checkbox/SimpleCheckbox';
import { DefaultLayout } from '@components/layouts/default.layout';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { prisma } from '@lib/db';
import { withSessionSsr } from '@lib/session';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, ReactElement, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CartItem, useCartStore } from 'stores/cart.store';

export default function CartItemsPage({ tiers, plugins }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addStoreItem = useCartStore(state => state.addCartItem);
    const removeStoreItem = useCartStore(state => state.removeCartItem);
    const clearBundles = useCartStore(state => state.clearBundles);
    const storedCart = useCartStore(state => state.cartItems);

    type SelectablePluginType = typeof plugins[0] & { isSelected: boolean; preselected: boolean };

    const [selectablePlugins, setSelectablePlugins] = useState<SelectablePluginType[]>([]);
    const [selected, setSelected] = useState('');
    const router = useRouter();

    useEffect(() => {
        setCart(storedCart);
    }, [storedCart]);

    useEffect(() => {
        setSelected(tiers.find(tier => tier.id === cart.find(item => item.type === 'BUNDLE')?.itemId)?.id || '');
    }, [cart, tiers]);

    useEffect(() => {
        const preselected = tiers.find(tier => tier.id === selected)?.plugins.map(plugin => plugin.id) || [];

        setSelectablePlugins(
            plugins.map(plugin => {
                const isPreselected = preselected.includes(plugin.id);
                return {
                    ...plugin,
                    isSelected: isPreselected
                        ? true
                        : cart.filter(item => item.type === 'PLUGIN').some(item => item.itemId === plugin.id),
                    preselected: isPreselected,
                };
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart, tiers, plugins, selected]);

    return (
        <>
            <Head>
                <title>Review subscription</title>
                <meta name="description" content="Review what subscriptions and plugins you want" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="w-full flex flex-col p-4 gap-4">
                <h1 className="w-full text-2xl font-medium">Review cart items</h1>

                <div className="w-full flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <RadioGroup
                            value={selected}
                            onChange={(value: string) => {
                                const tier = tiers.find(t => t.id === value);
                                if (!tier) return;

                                clearBundles();
                                addStoreItem({
                                    type: 'BUNDLE',
                                    itemId: tier.id,
                                });

                                tier.plugins.forEach(plugin => {
                                    removeStoreItem({
                                        type: 'PLUGIN',
                                        itemId: plugin.id,
                                    });
                                });

                                setSelected(value);
                            }}
                            className="w-full flex flex-col gap-2 text-lg font-medium">
                            <RadioGroup.Label>Subscription tier</RadioGroup.Label>
                            {tiers.map(tier => (
                                <RadioGroup.Option key={tier.id} value={tier.id} as={Fragment}>
                                    {({ checked }) => (
                                        <li
                                            className={`min-w-[300px] flex flex-row gap-2 px-4 py-2 justify-between items-center rounded-lg border ${
                                                checked ? 'border-blue-500 text-blue-500' : 'border-white text-white'
                                            }`}>
                                            <div className="flex flex-col">
                                                <span>{tier.name}</span>
                                                <span>${tier.price}</span>
                                            </div>
                                            {checked ? (
                                                <CheckCircleIcon className="w-5 h-5" />
                                            ) : (
                                                <div className="w-5 h-5"></div>
                                            )}
                                        </li>
                                    )}
                                </RadioGroup.Option>
                            ))}
                        </RadioGroup>
                        <ul className="flex flex-col gap-2">
                            <label className="text-lg font-medium">Plugins</label>
                            {selectablePlugins.map(plugin => {
                                return (
                                    <li key={plugin.id} className="w-full border-gray-200 dark:border-gray-600">
                                        <SimpleCheckbox
                                            checked={plugin.isSelected}
                                            onChange={value => {
                                                if (value) {
                                                    addStoreItem({
                                                        itemId: plugin.id,
                                                        type: 'PLUGIN',
                                                    });
                                                } else {
                                                    removeStoreItem({
                                                        itemId: plugin.id,
                                                        type: 'PLUGIN',
                                                    });
                                                }
                                            }}
                                            disabled={plugin.preselected}
                                            value={plugin.id}
                                            label={`${plugin.name} - $${plugin.price}`}
                                        />
                                    </li>
                                );
                            })}

                            <small className="text-xs font-medium text-gray-500">
                                *the prices are individual prices
                            </small>
                        </ul>
                    </div>
                    <div className="border-t border-gray-500 p-2 flex flex-row justify-between items-center">
                        <span>
                            {`Cart total: $${cart.reduce((acc, item) => {
                                if (item.type === 'BUNDLE') {
                                    const tier: typeof tiers[0] | undefined = tiers.find(t => t.id === item.itemId);
                                    if (tier) {
                                        return acc + tier.price;
                                    }
                                }
                                if (item.type === 'PLUGIN') {
                                    const plugin = plugins.find(p => p.id === item.itemId);
                                    if (plugin) {
                                        return acc + plugin.price;
                                    }
                                }
                                return acc;
                            }, 0)}`}
                        </span>
                        <SimpleButton
                            text="Checkout"
                            disabled={false}
                            onClick={async () => {
                                const res = await fetch('/api/shop/checkout', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        cart,
                                    }),
                                });

                                switch (res.status) {
                                    case 200:
                                        {
                                            const { clientSecret, subscriptionId } = await res.json();
                                            router.push(
                                                `/cart/checkout?clientSecret=${clientSecret}&subscriptionId=${subscriptionId}`
                                            );
                                        }
                                        break;
                                    case 403:
                                        toast.error('You are not logged in');
                                        break;
                                    case 400:
                                        toast.error('Invalid cart');
                                        break;
                                    default:
                                        toast.error('Something went wrong');
                                        break;
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

CartItemsPage.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
    if (!req.session || !req.session.userId) {
        return {
            props: {
                plugins: [],
                tiers: [],
            },
        };
    }
    res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=9');

    const subscriptions = await prisma.subscription.findMany({
        where: {
            userId: req.session.userId,
        },
        include: {
            plugins: true,
        },
    });

    const tiers = await prisma.subscriptionTemplate.findMany({
        where: {
            id: {
                notIn: subscriptions.map(s => s.subscriptionTemplateId ?? ''),
            },
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            plugins: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            },
        },
    });

    const plugins = await prisma.plugin.findMany({
        where: {
            id: {
                notIn: subscriptions.flatMap(s => s.plugins.map(p => p.id)),
            },
        },
        select: {
            id: true,
            name: true,
            price: true,
        },
    });

    return {
        props: {
            tiers,
            plugins,
        },
    };
});
