import { PermissionTypes } from '@lib/app-config/permissions';

export const privilegesFetcher = async (): Promise<PermissionTypes[]> => {
    const res = await fetch('api/auth/privileges');

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const privileges: PermissionTypes[] = data.privileges;
    return privileges;
};
