import { customAlphabet } from "nanoid";

export function getShortenedUrlIdGenerator(): (size?: number) => string {
    return customAlphabet('1234567890abcdef', 8);
};
