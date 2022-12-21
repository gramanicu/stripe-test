import { DefaultLayout } from '@components/layouts/default.layout';
import { ActionTypes, useGlobalContext } from '@contexts/global.context';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { prisma } from '@lib/db';
import { stripe } from '@lib/stripe';
import { Product } from '@lib/types';
import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useState } from 'react';
import toast from 'react-hot-toast';

export default function Home({ products }: InferGetStaticPropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common');
    const { resolvedTheme, setTheme } = useTheme();
    const { state, dispatch } = useGlobalContext();
    const router = useRouter();
    const [email, setEmail] = useState('');

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col p-4 gap-4">
                <h1
                    onClick={() => {
                        toast(`Changing theme to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`);
                        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                    }}
                    className="text-3xl font-bold">
                    Click me to change screen mode
                </h1>

                {state.email === '' ? (
                    <div className="flex flex-row gap-2 w-fit">
                        <input
                            onChange={e => {
                                setEmail(e.target.value);
                            }}
                            value={email}
                            className="flex flex-col px-2 py-1 justify-start items-center rounded-lg bg-transparent border border-black dark:border-white ring-0 focus:ring-0 focus:dark:border-blue-500"
                            type="email"
                            placeholder="your@email.com"
                        />
                        <button
                            onClick={async () => {
                                const re =
                                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                                if (!re.test(email)) {
                                    toast.error('Invalid email');
                                    return;
                                }

                                const res = await fetch('/api/user/login', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        email,
                                    }),
                                });

                                if (res.status === 200) {
                                    const msg = (await res.json()).message;
                                    dispatch({
                                        type: ActionTypes.setEmail,
                                        payload: {
                                            email,
                                        },
                                    });
                                    toast.success(msg);
                                } else {
                                    toast.error('Login failed');
                                }
                            }}
                            type="button"
                            className="flex flex-row gap-2 justify-center items-center px-2 py-1 rounded-lg border border-black dark:border-white hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all">
                            Login
                        </button>
                    </div>
                ) : (
                    <h3>{`${t('greet')} ${state.email}`}</h3>
                )}
                <div className="w-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-10">
                    {products.map(product => {
                        return (
                            <article
                                className="max-w-full w-full sm:max-w-sm sm:min-h-[228px] h-full sm:w-fit flex flex-col justify-between gap-4 p-4 rounded-lg border border-black dark:border-white"
                                key={product.id}>
                                <header className="flex flex-col gap-2">
                                    <h2 className="text-xl font-bold">{product.name}</h2>
                                    <p className="text-lg text-gray-500">{product.description}</p>
                                </header>
                                <div className="flex flex-row justify-between items-center w-full">
                                    <span>{`${
                                        (product.price.unit_amount ?? 0) / 100.0
                                    } ${product.price.currency.toUpperCase()}`}</span>
                                    {state.email && (
                                        <button
                                            className="flex flex-row gap-2 justify-center items-center px-2 py-1 rounded-lg border border-black dark:border-white hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all"
                                            onClick={() => {
                                                const arr = state.cart;
                                                const index = state.cart.findIndex(c_plugin => {
                                                    return c_plugin.id === product.id;
                                                });

                                                if (index !== -1) {
                                                    arr.splice(index, 1);
                                                } else {
                                                    arr.push(product);
                                                }

                                                if (state.email !== '') {
                                                    dispatch({
                                                        type: ActionTypes.setCart,
                                                        payload: {
                                                            cart: arr,
                                                        },
                                                    });
                                                }
                                            }}>
                                            {state.cart.findIndex(c_plugin => {
                                                return c_plugin.id === product.id;
                                            }) === -1
                                                ? 'Add'
                                                : 'Remove'}
                                            <ShoppingCartIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
                {state.email && state.cart.length > 0 && (
                    <button
                        onClick={async () => {
                            const res = await fetch('/api/shop/new_subscription', {
                                method: 'POST',
                                body: JSON.stringify({
                                    email,
                                    cart: state.cart,
                                }),
                            });

                            if (res.status === 200) {
                                const data = await res.json();

                                router.push(
                                    `/checkout?subscriptionId=${data.subscriptionId}&clientSecret=${data.clientSecret}`
                                );
                            } else {
                                toast.error('Checkout failed');
                            }
                        }}
                        className="flex flex-row gap-2 justify-center items-center px-2 py-1 rounded-lg border border-black dark:border-white hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all text-xl sm:max-w-lg">
                        Go to checkout
                    </button>
                )}
            </div>
        </>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export async function getServerSideProps({ locale }: { locale: string }) {
    const plugins = await prisma.plugin.findMany();

    const products = await Promise.all(
        plugins.map(async plugin => {
            const stripeProduct = await stripe.products.retrieve(plugin.stripeProductId, {
                expand: ['default_price'],
            });
            return {
                id: plugin.id,
                name: plugin.name,
                description: plugin.description,
                price: stripeProduct.default_price,
            } as Product;
        })
    );

    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
            products,
        },
    };
}
