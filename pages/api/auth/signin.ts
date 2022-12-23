import { SESSION_DURATION } from '@lib/constants';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email as string,
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

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
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default withSessionRoute(handler);
