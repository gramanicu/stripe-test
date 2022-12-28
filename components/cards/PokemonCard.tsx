import Image from 'next/image';

export type PokemonCardProps = {
    name: string;
    url: string;
    onClick: () => void;
    buttonText: string;
    disabled?: boolean;
    priority?: boolean;
};

export default function PokemonCard({
    name,
    url,
    onClick,
    disabled = false,
    buttonText,
    priority = false,
}: PokemonCardProps) {
    return (
        <article className="flex flex-col gap-2 rounded-lg border border-secondary min-w-full sm:min-w-[128px]">
            <header className="rounded-t-lg border-b border-secondary bg-secondary text-black pt-2 pb-1 px-2 max-w-[160px]">
                <h2 className="text-xl font-bold font-lato capitalize truncate">{name}</h2>
            </header>
            <div className="relative aspect-square w-full px-2 py-1">
                <Image
                    priority={priority}
                    sizes="(max-width: 640px) 196px, 128px"
                    className="relative"
                    alt={name}
                    src={url}
                    fill
                />
            </div>
            <footer className={`px-2 pt-1 pb-2 border-t border-secondary rounded-b-lg bg-secondary text-black`}>
                <button disabled={disabled} className={`text-sm font-bold disabled:text-gray-600`} onClick={onClick}>
                    {buttonText}
                </button>
            </footer>
        </article>
    );
}
