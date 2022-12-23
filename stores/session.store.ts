import { LOCAL_STORAGE_PREFIX } from '@lib/constants';
import create from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionInfo = {
    expire_at: number;
    email: string;
};

export type SessionStoreType = {
    session: SessionInfo;
    updateEmail: (newEmail: string) => void;
    updateExpireAt: (newExpireAt: number) => void;
    updateSession: (newSession: SessionInfo) => void;
};

const sessionKey = `${LOCAL_STORAGE_PREFIX}session`;

export const useSessionStore = create<SessionStoreType>()(
    persist(
        set => ({
            session: {
                expire_at: 0,
                email: '',
            },
            updateEmail: (newEmail: string) => set(state => ({ session: { ...state.session, email: newEmail } })),
            updateExpireAt: (newExpireAt: number) =>
                set(state => ({ session: { ...state.session, expire_at: newExpireAt } })),
            updateSession: (newSession: SessionInfo) =>
                set(state => ({ session: { ...state.session, ...newSession } })),
        }),
        {
            name: sessionKey,
            getStorage: () => sessionStorage,
        }
    )
);
