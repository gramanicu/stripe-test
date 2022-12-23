import { is_logged_in } from '@lib/auth';
import { compute_permissions } from '@lib/auth/permissions';
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
        include: {
            subscriptions: true,
        },
    });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const privileges = await compute_permissions(user.subscriptions);

    return res.status(200).json({ privileges, message: "User's privileges retrieved" });
};

export default withSessionRoute(handler);
