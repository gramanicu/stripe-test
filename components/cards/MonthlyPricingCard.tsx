import { CheckIcon } from '@heroicons/react/24/outline';

export type MonthlyPricingCardProps = {
    title: string;
    description: string;
    price: string;
    features: string[];
    onClick: () => void;
};

export default function MonthlyPricingCard({ title, description, price, features, onClick }: MonthlyPricingCardProps) {
    return (
        <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
            <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
            <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">{description}</p>
            <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">{price}</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
                {features.map((feature, index) => {
                    return (
                        <li key={index} className="flex items-center space-x-3">
                            <CheckIcon className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={onClick}
                className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">
                Get started
            </button>
        </div>
    );
}
