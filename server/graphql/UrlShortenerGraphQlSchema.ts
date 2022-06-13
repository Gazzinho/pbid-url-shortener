import { buildSchema, GraphQLSchema } from 'graphql';
import ShortenedUrls, { ShortenedUrl } from '../schema/shortenedUrlSchema';
import { getShortenedUrlIdGenerator } from '../shortenedUrlId';
const retry = require('async-retry');
import dotenv from 'dotenv';

dotenv.config();

const generateShortenedUrlId = getShortenedUrlIdGenerator();
// Note: async-retry maxTimeout default is Infinity, setting to 2s
const maxGenerateShortedUrlIdRetryTimeout = process.env.MAX_GENERATE_SHORTED_URL_ID_RETRY_TIMEOUT || 2000;

export const urlShortenerGraphQlSchema: GraphQLSchema = buildSchema(`
input CreateShortenedUrlInput {
    longUrl: String!
}

type ShortenedUrl {
    longUrl: String!
    shortUrlId: String!
    createdAt: String!
}

type ShortenedUrls {
    shortenedUrls: [ShortenedUrl]!
}

type Mutation {
    createShortenedUrl(input: CreateShortenedUrlInput): ShortenedUrl
}

type Query {
    getShortenedUrl(longUrl: String): ShortenedUrl
    getShortenedUrls: [ShortenedUrl]
}
`);

export type CreateShortenedUrlInput = Pick<ShortenedUrl, "longUrl">;

const getShortenedUrl = async (args: {longUrl: string}): Promise<ShortenedUrl | null> => {
    try {
        return await ShortenedUrls.findOne({ longUrl: args.longUrl });
    } catch (error) {
        return Promise.reject(error);
    }
}

const getShortenedUrls = async (): Promise<ShortenedUrl[]> => {
    try {
        const query = ShortenedUrls.find();
        query.sort({createdAt: "descending"});
        return await query;
    } catch (error) {
        return Promise.reject(error);
    }
};

const createShortenedUrl = async (args: {input: CreateShortenedUrlInput}): Promise<ShortenedUrl> => {
    if (!isValidUrl(args.input.longUrl)) {
        return Promise.reject(`args.input.longUrl is not a valid URL: ${args.input.longUrl}`);
    }

    try {
        const existingShortenedUrl = await ShortenedUrls.findOne({ longUrl: args.input.longUrl });
        if (existingShortenedUrl) {
            return existingShortenedUrl;
        }

        const shortUrlId: string = await retry(
            async () => {
                const generatedId = await generateShortenedUrlId(8);
                const existingShortenedUrl = await ShortenedUrls.findOne({ shortUrlId: generatedId });
                if (existingShortenedUrl) {
                    throw new Error("shortUrlId has already been used");
                }
                return generatedId;
            },
            {
                retries: 3,
                opts: {minTimeout: 100, maxTimeout: maxGenerateShortedUrlIdRetryTimeout}
            }
        );

        const newShortenedUrl = new ShortenedUrls({
            longUrl: args.input.longUrl,
            shortUrlId: shortUrlId
        });
        await newShortenedUrl.save();

        return newShortenedUrl;
    } catch(error) {
        return Promise.reject(error);
    }
};

function isValidUrl(urlString: string): boolean {
    try {
        return !!new URL(urlString);
    } catch(error) {
        return false;
    }
}

export const urlShortenerGraphQlSchemaRoot = {
    getShortenedUrl,
    getShortenedUrls,
    createShortenedUrl
};
