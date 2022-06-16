import { GRAPHQL_URL } from "./constants";

export type ShortenedUrl = {
    shortUrlId: string,
    longUrl: string
};

export async function fetchGraphQL(text: string, variables: any) {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: text,
            variables,
        }),
    });

    return await response.json();
}
