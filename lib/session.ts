import { IronSessionOptions } from 'iron-session';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from 'next';

import { AUTH_SECRET } from './config';
import { SESSION_COOKIE_NAME, SESSION_DURATION } from './constants';

export const sessionOptions: IronSessionOptions = {
    password: AUTH_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
    },
    ttl: SESSION_DURATION,
};

declare module 'iron-session' {
    interface IronSessionData {
        userId: string;
    }
}

export function withSessionRoute(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
    handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
    return withIronSessionSsr(handler, sessionOptions);
}
