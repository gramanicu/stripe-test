import { ActionTypes, useGlobalContext } from '@contexts/global.context';
import { Product } from '@lib/types';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutForm({
    products,
    subscriptionId,
}: {
    products: Product[];
    subscriptionId: string;
}): JSX.Element {
    const stripe = useStripe();
    const elements = useElements();
    const { state, dispatch } = useGlobalContext();

    const [plugins, setPlugins] = useState(
        products.map(product => {
            return {
                ...product,
                checked:
                    state.cart.findIndex(s_product => {
                        return s_product.id === product.id;
                    }) !== -1,
            };
        })
    );

    useEffect(() => {
        setPlugins(
            products.map(product => {
                return {
                    ...product,
                    checked:
                        state.cart.findIndex(s_product => {
                            return s_product.id === product.id;
                        }) !== -1,
                };
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(state.cart)]);

    async function handleCheckoutFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const res = await fetch('/api/shop/update_subscriptions', {
            method: 'POST',
            body: JSON.stringify({
                subscriptionId: subscriptionId,
                cart: state.cart,
            }),
        });

        if (res.status !== 200) return;

        if (!stripe || !elements) {
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements: elements,
            redirect: 'always',
            confirmParams: {
                return_url: 'http://localhost:3000/',
            },
        });

        if (error) {
            toast.error(error.message || 'Error');
        }
    }
    return (
        <>
            <form className="flex flex-col gap-4" onSubmit={e => handleCheckoutFormSubmit(e)}>
                <PaymentElement />
                <div className="flex flex-col gap-2 border border-gray-500 p-2 rounded-lg">
                    <h3 className="text-xl font-medium">Cart</h3>
                    {plugins.map(plugin => {
                        return (
                            <div className="flex items-center mr-4" key={plugin.id}>
                                <input
                                    id={`${plugin.id}-checkbox`}
                                    type="checkbox"
                                    onChange={() => {
                                        const arr = state.cart;
                                        const index = state.cart.findIndex(c_plugin => {
                                            return c_plugin.id === plugin.id;
                                        });

                                        if (index !== -1) {
                                            arr.splice(index, 1);
                                        } else {
                                            arr.push(plugin);
                                        }

                                        dispatch({
                                            type: ActionTypes.setCart,
                                            payload: {
                                                cart: arr,
                                            },
                                        });
                                    }}
                                    value={plugin.id}
                                    checked={plugin.checked}
                                    className="w-4 h-4 text-red-600 bg-gray-100 rounded border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                    htmlFor={`${plugin.id}-checkbox`}
                                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    {plugin.name}
                                </label>
                            </div>
                        );
                    })}
                </div>

                <button>Submit</button>
            </form>
        </>
    );
}
