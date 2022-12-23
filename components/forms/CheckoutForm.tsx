import { Product } from '@lib/types';
import { LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutForm({ products }: { products: Product[]; subscriptionId: string }): JSX.Element {
    const stripe = useStripe();
    const elements = useElements();

    async function handleCheckoutFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

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
                <LinkAuthenticationElement
                    onChange={event => {
                        console.log(event);
                    }}
                />
                <PaymentElement
                    options={{
                        layout: 'accordion',
                        defaultValues: {
                            billingDetails: {
                                name: 'John Doe',
                                phone: '888-888-8888',
                            },
                        },
                    }}
                />

                <button>Submit</button>
            </form>
        </>
    );
}
