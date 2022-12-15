/**
 * Truncate middle of a string and replace the middle with dots: '.'
 * @param text The string to truncate
 * @param startChars How many chars to keep at start
 * @param endChars How many chars to keep at the end
 * @param maxLength How many chars to have in total
 * @returns The truncated string (with ... put in extra spaces)
 */
export function truncate(text: string, startChars: number, endChars: number, maxLength: number) {
    if (text.length > maxLength) {
        let start = text.substring(0, startChars);
        const end = text.substring(text.length - endChars, text.length);
        while (start.length + end.length < maxLength) {
            start = start + '.';
        }
        return start + end;
    }
    return text;
}

/**
 * Compute the percentage that our value represents out of a number
 * @param value The value
 * @param outOf The number to check against
 * @returns The percentage
 */
export function whatPercent(value: number, outOf: number) {
    if (outOf == 0) return 0;

    return (100.0 * value) / outOf;
}

/**
 * Capitalize the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}

export function encodeString(str: string) {
    const newStr = Buffer.from(str).toString('base64');
    return newStr;
}

export function decodeString(str: string) {
    const newStr = Buffer.from(str, 'base64').toString();
    return newStr;
}

export function toFixed(value: number, decimals: number) {
    return Math.trunc(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function countDecimalDigits(number: number) {
    const char_array = number.toString().split(''); // split every single char
    const not_decimal = char_array.lastIndexOf('.');
    return not_decimal < 0 ? 0 : char_array.length - not_decimal;
}
