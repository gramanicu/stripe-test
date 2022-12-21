// This pattern of declaring "enums" as string unions was taken
// from https://stackoverflow.com/questions/40275832/typescript-has-unions-so-are-enums-redundant

export const permissions_list = [
    'pokémon:owned:list',
    'pokémon:owned:add',
    'pokémon:owned:remove',
    'pokémon:list',
    'pokémon:add-page',
    'pokémon:view_count',
] as const;

export type PermissionTypes = typeof permissions_list[number];
