import { SESSION_DURATION } from '@lib/constants';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                email: email as string,
            },
        });

        req.session.userId = user.id;
        await req.session.save();

        return res.status(200).json({
            message: 'Signed in',
            session_duration: SESSION_DURATION,
            user: {
                email: user.email,
            },
        });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    return res.status(409).json({ message: 'User already exists' });
                default:
                    return res.status(500).json({ message: 'Internal server error' });
            }
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default withSessionRoute(handler);
