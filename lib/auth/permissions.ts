import { PermissionTypes } from '@lib/app-config/permissions';
import { prisma } from '@lib/db';
import { stripe } from '@lib/stripe';
import { Permission, Subscription, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

export async function compute_permissions(user_subscriptions: Subscription[]): Promise<Permission[]> {
    const subscriptions = user_subscriptions.filter(async subscription => {
        const sub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

        return sub.status === 'active';
    });

    const permissions = await prisma.permission.findMany({
        where: {
            plugins: {
                some: {
                    subscriptions: {
                        some: {
                            id: {
                                in: subscriptions.map(subscription => subscription.id),
                            },
                        },
                    },
                },
            },
        },
    });

    return permissions;
}

export async function check_permissions(userId: string, permission: PermissionTypes): Promise<boolean>;
export async function check_permissions(user: User, permission: PermissionTypes): Promise<boolean>;

export async function check_permissions(userId: string, permissionList: PermissionTypes[]): Promise<boolean>;
export async function check_permissions(user: User, permissionList: PermissionTypes[]): Promise<boolean>;

export async function check_permissions(
    user: unknown,
    permissions: PermissionTypes | PermissionTypes[]
): Promise<boolean> {
    let userObject: User & { privileges: Permission[] };
    try {
        const res = await prisma.user.findUnique({
            where: {
                id: typeof user === 'string' ? user : (user as User).id,
            },
            include: {
                subscriptions: true,
            },
        });

        if (!res) {
            throw new Error('User not found');
        }

        userObject = { ...res, privileges: await compute_permissions(res.subscriptions) };
    } catch (err) {
        // https://www.prisma.io/docs/reference/api-reference/error-reference
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2003':
                    throw new Error('User not found');
                default:
                    throw new Error(err.message);
            }
        }

        throw err;
    }

    const permissions_list = Array.isArray(permissions) ? permissions : [permissions];

    return permissions_list.every(permission => {
        return userObject.privileges.some(privilege => {
            return privilege.name === permission;
        });
    });
}
