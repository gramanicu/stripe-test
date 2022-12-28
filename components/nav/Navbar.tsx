import AuthButton from '@components/auth/AuthButton';
import { privilegesFetcher } from '@lib/fetchers/fetchPrivileges';
import Link from 'next/link';
import { useSessionStore } from 'stores/session.store';
import useSWR from 'swr';

export default function Navbar() {
    const stored_session = useSessionStore(state => state.session);
    const { data } = useSWR(stored_session.email !== '' ? 'auth/privileges' : null, privilegesFetcher);

    return (
        <div className="w-full shadow-xl">
            <div className="flex flex-row justify-between gap-2 items-center px-4 py-2 max-w-6xl mx-auto">
                <span className="text-xl font-medium">
                    <Link href={'/'}>
                        <span className="text-green-500">Stripe</span>Test
                    </Link>
                </span>
                <div className="flex flex-row gap-2">
                    {data && (
                        <>
                            {data.includes('pokémon:owned:list') && (
                                <Link className="flex flex-col justify-center" href="/inventory">
                                    Inventory
                                </Link>
                            )}
                            {data.includes('pokémon:list') && (
                                <Link className="flex flex-col justify-center" href="/shop">
                                    Shop
                                </Link>
                            )}
                        </>
                    )}
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <AuthButton />
                </div>
            </div>
        </div>
    );
}
