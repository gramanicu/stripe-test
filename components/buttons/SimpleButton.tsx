export type SimpleButtonProps = {
    text: string;
    disabled: boolean;
    onClick: () => void;
};

export default function SimpleButton({ text, disabled, onClick }: SimpleButtonProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            className="flex flex-row justify-center items-center px-4 py-2 rounded-lg bg-primary dark:bg-transparent hover:dark:bg-gray-800 dark:ring-1 dark:ring-white disabled:dark:ring-gray-500 text-white disabled:text-gray-500"
            onClick={onClick}>
            {text}
        </button>
    );
}
