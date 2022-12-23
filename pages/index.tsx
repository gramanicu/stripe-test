import MonthlyPricingCard from '@components/cards/MonthlyPricingCard';
import { DefaultLayout } from '@components/layouts/default.layout';
import { prisma } from '@lib/db';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Fragment, ReactElement } from 'react';

export default function Home({ tiers, plugins }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <Head>
                <title>Stripe learning</title>
                <meta name="description" content="An app used to learn stripe usage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col p-4 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
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
                                    onClick={() => console.log('clicked')}
                                />
                            </Fragment>
                        );
                    })}
                </div>
                <div className="flex flex-col gap-2">
                    {plugins.map((plugin, index) => {
                        return (
                            <div className="flex flex-row gap-2" key={index}>
                                <h1>{plugin.name}</h1>
                                <p>${plugin.price}</p>
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

export async function getServerSideProps() {
    const tiers = await prisma.subscriptionTemplate.findMany({
        select: {
            name: true,
            description: true,
            price: true,
            plugins: {
                select: {
                    name: true,
                    price: true,
                },
            },
        },
    });

    const plugins = await prisma.plugin.findMany({
        select: {
            name: true,
            price: true,
        },
    });

    return {
        props: {
            tiers: tiers,
            plugins: plugins,
        },
    };
}
