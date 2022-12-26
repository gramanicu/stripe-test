export type SimpleCheckboxProps = {
    label: string;
    value: string;
    disabled: boolean;
    checked: boolean;
    onChange: (newValue: boolean) => void;
};

export default function SimpleCheckbox({ label, checked, disabled, value, onChange }: SimpleCheckboxProps) {
    return (
        <div className="flex items-center">
            <input
                id={label}
                type="checkbox"
                disabled={disabled}
                checked={checked}
                value={value}
                onChange={e => onChange(e.target.checked)}
                className="w-4 h-4 text-primary cursor-pointer disabled:cursor-default bg-gray-100 rounded border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
                htmlFor={label}
                className={`whitespace-nowrap ${disabled ? 'text-gray-500' : 'text-white'} ml-2 text-sm font-medium`}>
                {label}
            </label>
        </div>
    );
}
