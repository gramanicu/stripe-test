import { PermissionTypes } from '@lib/app-config/permissions';
import { prisma } from '@lib/db';
import { Privilege, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

export async function check_permissions(userId: string, permission: PermissionTypes): Promise<boolean>;
export async function check_permissions(user: User, permission: PermissionTypes): Promise<boolean>;
export async function check_permissions(
    user: User & { privileges: Privilege[] },
    permission: PermissionTypes
): Promise<boolean>;
export async function check_permissions(userId: string, permissionList: PermissionTypes[]): Promise<boolean>;
export async function check_permissions(user: User, permissionList: PermissionTypes[]): Promise<boolean>;
export async function check_permissions(
    user: User & { privileges: Privilege[] },
    permissionList: PermissionTypes[]
): Promise<boolean>;

export async function check_permissions(
    user: unknown,
    permissions: PermissionTypes | PermissionTypes[]
): Promise<boolean> {
    let userObject: User & { privileges: Privilege[] };
    if (typeof user === 'string' || (user as User & { privileges: Privilege[] }).privileges === undefined) {
        try {
            const res = await prisma.user.findUnique({
                where: {
                    id: typeof user === 'string' ? user : (user as User).id,
                },
                include: {
                    privileges: true,
                },
            });

            if (!res) {
                throw new Error('User not found');
            }

            userObject = res;
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
    }

    const permissions_list = Array.isArray(permissions) ? permissions : [permissions];

    return permissions_list.every(permission => {
        return userObject.privileges.some(privilege => {
            return privilege.permissionName === permission;
        });
    });
}
