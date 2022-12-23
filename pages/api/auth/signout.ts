import { withSessionRoute } from '@lib/session';
import { NextApiHandler } from 'next';

const logoutRoute: NextApiHandler = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    req.session.destroy();
    res.status(200).json({ message: 'Signed out' });
};

export default withSessionRoute(logoutRoute);
