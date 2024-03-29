import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { privilegesFetcher } from '@lib/fetchers/fetchPrivileges';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SessionInfo, useSessionStore } from 'stores/session.store';
import useSWR from 'swr';

import AuthModal from './AuthModal';

export default function AuthButton() {
    const [session, setSession] = useState<SessionInfo>({ email: '', expire_at: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateEmail = useSessionStore(state => state.updateEmail);
    const stored_session = useSessionStore(state => state.session);
    const { mutate } = useSWR(stored_session.email !== '' ? 'auth/privileges' : null, privilegesFetcher);

    useEffect(() => {
        mutate();
        setSession(stored_session);
    }, [mutate, stored_session]);

    const handleSignout = async () => {
        const res = await fetch('/api/auth/signout', {
            method: 'DELETE',
        });

        if (res.status !== 200) {
            const { message } = await res.json();

            toast.error(message);
        }

        updateEmail('');

        toast.success('Signed out');
        mutate();
        window.location.reload();
    };

    return (
        <div className="flex flex-row justify-center items-center gap-2 px-2 py-1">
            <button
                className="flex flex-row justify-center items-center gap-2 rounded-lg"
                onClick={() => {
                    if (session.email) {
                        handleSignout();
                        return;
                    }

                    setIsModalOpen(true);
                }}>
                {!session.email ? <span>Sign in</span> : <span>{session.email}</span>}
                {session.email ? (
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                ) : (
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                )}
            </button>
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
