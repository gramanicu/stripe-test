import { Switch } from '@headlessui/react';

export type SwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    name?: string;
};

export default function SimpleSwitch({ checked, onChange, name = 'Simple switch' }: SwitchProps) {
    return (
        <Switch
            checked={checked}
            onChange={onChange}
            className={`${
                checked ? 'bg-white border-transparent' : 'border-white'
            } transition-all ease-in-out duration-500 border relative inline-flex h-5 w-9 items-center rounded-full`}>
            <span className="sr-only">{name}</span>
            <span
                className={`transform transition-all ease-in-out duration-500 ${
                    checked ? 'translate-x-5 bg-black' : 'translate-x-1 bg-white'
                } inline-block h-3 w-3 transform rounded-full `}
            />
        </Switch>
    );
}
