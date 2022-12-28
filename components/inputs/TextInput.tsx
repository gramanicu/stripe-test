import { useState } from 'react';

export type TextInputProps = {
    text: string;
    onChange: (value: string) => void;
    name?: string;
    placeholder?: string;
};

export default function TextInput({ text, onChange, name = 'text_input', placeholder = '...' }: TextInputProps) {
    const [value, setValue] = useState(text);

    return (
        <div>
            <input
                className={`flex flex-col w-full px-2 py-1 justify-start items-center rounded-lg bg-transparent border ring-0 focus:ring-0`}
                type="text"
                value={value}
                placeholder={placeholder}
                name={name}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
        </div>
    );
}
