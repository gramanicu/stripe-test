import { is_logged_in } from '@lib/auth';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.session;

    if (!(await is_logged_in(req))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Authenticated' });
};

export default withSessionRoute(handler);
