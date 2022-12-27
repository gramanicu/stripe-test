import CheckoutForm from '@components/forms/CheckoutForm';
import { DefaultLayout } from '@components/layouts/default.layout';
import { STRIPE_PUBLISHABLE_KEY } from '@lib/config';
import { prisma } from '@lib/db';
import { withSessionSsr } from '@lib/session';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import { ReactElement } from 'react';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function Checkout({ clientSecret, email }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Elements
            stripe={stripePromise}
            options={{
                appearance: {
                    theme: 'night',
                },
                clientSecret: clientSecret,
            }}>
            <Head>
                <title>Checkout page</title>
                <meta name="description" content="Enter payment information to checkout" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col p-4 gap-4">
                <CheckoutForm email={email} />
            </div>
        </Elements>
    );
}

Checkout.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

interface IParams extends ParsedUrlQuery {
    clientSecret: string | undefined;
    subscriptionId: string | undefined;
}

export const getServerSideProps = withSessionSsr(async ({ query, req, res }) => {
    if (!req.session || !req.session.userId) {
        return {
            props: {
                clientSecret: '',
                subscriptionId: '',
                email: '',
            },
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    const clientSecret = (query as IParams).clientSecret || '';
    const subscriptionId = (query as IParams).subscriptionId || '';

    const user = await prisma.user.findUnique({
        where: {
            id: req.session.userId,
        },
    });

    if (!user) {
        return {
            props: {
                clientSecret: '',
                subscriptionId: '',
                email: '',
            },
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            clientSecret,
            subscriptionId,
            email: user.email,
        },
    };
});
