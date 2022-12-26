import { DOMAIN } from '@lib/config';
import { LinkAuthenticationElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';

export type CheckoutFormProps = {
    email: string;
};

export default function CheckoutForm({ email }: CheckoutFormProps): JSX.Element {
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
                return_url: `${DOMAIN}`,
            },
        });

        if (error) {
            toast.error(error.message || 'Error');
        }
    }
    return (
        <>
            <form className="flex flex-col gap-4" onSubmit={e => handleCheckoutFormSubmit(e)}>
                <LinkAuthenticationElement />
                <PaymentElement
                    options={{
                        layout: 'accordion',
                        defaultValues: {
                            billingDetails: {
                                name: 'John Doe',
                                email,
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
