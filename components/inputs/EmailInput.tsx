import { useEffect, useState } from 'react';

export type EmailInputProps = {
    email: string;
    onChange: (value: string, isValid: boolean) => void;
    showErrors: boolean;
    name?: string;
    placeholder?: string;
};

export default function EmailInput({
    email,
    onChange,
    showErrors,
    name = 'email_address',
    placeholder = 'john@doe.com',
}: EmailInputProps) {
    const [value, setValue] = useState(email);
    const [error, setError] = useState('');

    useEffect(() => {
        const email_regex =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (value.length > 0 && !email_regex.test(value)) {
            onChange(value, false);
            setError('Please enter a valid email address');
        } else {
            onChange(value, true);
            setError('');
        }
    }, [onChange, value]);

    return (
        <div>
            <input
                className={`flex flex-col px-2 py-1 justify-start items-center rounded-lg bg-transparent border ring-0 focus:ring-0 ${
                    error === ''
                        ? 'border-black dark:border-white focus:dark:border-blue-500'
                        : 'border-red-500 dark:border-red-500 focus:dark:border-red-500'
                } `}
                type="email"
                value={value}
                placeholder={placeholder}
                name={name}
                onChange={e => {
                    setValue(e.target.value);
                }}
            />
            {showErrors && <div>{error}</div>}
        </div>
    );
}
