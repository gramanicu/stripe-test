import AuthButton from '@components/auth/AuthButton';
import Link from 'next/link';

export default function Navbar() {
    return (
        <div className="w-full shadow-xl">
            <div className="flex flex-row justify-between gap-2 items-center px-4 py-2 max-w-6xl mx-auto">
                <span className="text-xl font-medium">
                    <Link href={'/'}>
                        <span className="text-green-500">Stripe</span>Test
                    </Link>
                </span>
                <div className="flex flex-row gap-2">
                    <Link className="flex flex-col justify-center" href="/inventory">
                        Inventory
                    </Link>
                    <Link className="flex flex-col justify-center" href="/shop">
                        Shop
                    </Link>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <AuthButton />
                </div>
            </div>
        </div>
    );
}
