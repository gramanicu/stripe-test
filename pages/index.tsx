import AuthModal from '@components/auth/AuthModal';
import MonthlyPricingCard from '@components/cards/MonthlyPricingCard';
import { DefaultLayout } from '@components/layouts/default.layout';
import { prisma } from '@lib/db';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, ReactElement, useState } from 'react';
import { useCartStore } from 'stores/cart.store';
import { useSessionStore } from 'stores/session.store';

export default function Home({ tiers, plugins }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const addStoreItem = useCartStore(state => state.addCartItem);
    const clearCart = useCartStore(state => state.clearCart);
    const { email } = useSessionStore(state => state.session);
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const redirectAfterLogin = () => {
        setIsModalOpen(false);
        router.push('/cart/items');
    };

    return (
        <>
            <Head>
                <title>Stripe learning</title>
                <meta name="description" content="An app used to learn stripe usage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col p-4 gap-4">
                <div className="w-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                    {tiers.map((tier, index) => {
                        return (
                            <Fragment key={index}>
                                <MonthlyPricingCard
                                    title={tier.name}
                                    description={tier.description}
                                    price={`$${tier.price}`}
                                    features={tier.plugins.map(plugin => {
                                        return `${plugin.name} - $${plugin.price}`;
                                    })}
                                    onClick={() => {
                                        clearCart();
                                        addStoreItem({
                                            itemId: tier.id,
                                            type: 'BUNDLE',
                                        });

                                        if (!email) setIsModalOpen(true);
                                        else router.push('/cart/items');
                                    }}
                                />
                            </Fragment>
                        );
                    })}
                </div>
                <AuthModal
                    isOpen={isModalOpen}
                    onClose={isSignedIn => {
                        if (isSignedIn) {
                            redirectAfterLogin();
                        }
                        setIsModalOpen(false);
                    }}
                />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-medium">Plugins</h2>
                    {plugins.map((plugin, index) => {
                        return (
                            <div className="flex flex-row gap-2 items-baseline" key={index}>
                                <h3 className="text-lg font-light">{plugin.name}</h3>
                                <p className="text-gray-500">${plugin.price}</p>
                                {plugin.description && <span>{` - ${plugin.description}`}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    const tiers = await prisma.subscriptionTemplate.findMany({
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
        select: {
            id: true,
            name: true,
            price: true,
            description: true,
        },
    });

    return {
        props: {
            tiers: tiers,
            plugins: plugins,
        },
    };
}
