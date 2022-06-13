import ShortenedUrls from '../schema/shortenedUrlSchema';

const defaultShortUrlId = "f8a54f2";
const mockGenerateShortenedUrlId = jest.fn().mockImplementation(() => {
    return Promise.resolve(defaultShortUrlId);
});
jest.mock('../shortenedUrlId', () => {
    return {
        '__esModule': true,
        getShortenedUrlIdGenerator: () => mockGenerateShortenedUrlId
    };
});

import { CreateShortenedUrlInput, urlShortenerGraphQlSchemaRoot } from './UrlShortenerGraphQlSchema';

const mockSave =  jest.fn().mockImplementation(() => {
    return Promise.resolve();
});
jest.mock('../schema/shortenedUrlSchema', () => {
    return jest.fn().mockImplementation((args: any) => {
        return {
            '__esModule': true,
            save: mockSave,
            shortUrlId: args.shortUrlId,
            longUrl: args.longUrl
        };
    });
});

describe('UrlShortenerGraphQlSchema', () => {
    beforeEach(() => {
        (ShortenedUrls as any).mockClear();
        mockSave.mockClear();
        mockGenerateShortenedUrlId.mockClear();
    });

    describe('getShortenedUrls()', () => {
        it('returns a promise with an array containing all ShortenedUrls from the db in descending order by createdAt date', async () => {
            const firstShortenedUrl = {
                shortUrlId: "f8a54f2",
                longUrl: "https://example.com/firstShortenedUrl",
                createdAt: "2022-06-15 18:06"
            };
            const secondShortenedUrl = {
                shortUrlId: "d5b57014",
                longUrl: "https://example.com/secondShortenedUrl",
                createdAt: "2022-06-15 18:10"
            };
            const query = Promise.resolve([secondShortenedUrl, firstShortenedUrl]);
            (query as any).sort = jest.fn();
            const mockFind = jest.fn().mockImplementation(() => {
                return query;
            });
            ShortenedUrls.find = mockFind;
        
            const queryResult = await urlShortenerGraphQlSchemaRoot.getShortenedUrls();
            expect(mockFind).toHaveBeenCalledTimes(1);
            expect((query as any).sort).toHaveBeenCalledTimes(1);
            expect((query as any).sort).toHaveBeenCalledWith({createdAt: "descending"});
            expect(queryResult).toStrictEqual([
                {
                    shortUrlId: "d5b57014",
                    longUrl: "https://example.com/secondShortenedUrl",
                    createdAt: "2022-06-15 18:10"
                },
                {
                    shortUrlId: "f8a54f2",
                    longUrl: "https://example.com/firstShortenedUrl",
                    createdAt: "2022-06-15 18:06"
                }
            ]);
        });

        it('returns a rejected promise with an error when the query errors', async () => {
            const query = Promise.reject("Query error");
            (query as any).sort = jest.fn();
            const mockFind = jest.fn().mockImplementation(() => {
                return query;
            });
            ShortenedUrls.find = mockFind;

            let resultingError;
            try {
                await urlShortenerGraphQlSchemaRoot.getShortenedUrls();
            } catch (error) {
                resultingError = error;
            }
            expect(resultingError).toBe("Query error");
        });
    });

    describe('getShortenedUrl({longUrl: string})', () => {
        it('returns a resolved promise with the existing ShortenedUrl from the db', async () => {
            const shortenedUrl = {
                shortUrlId: "f8a54f2",
                longUrl: "https://example.com/firstShortenedUrl"
            };
            ShortenedUrls.findOne = jest.fn().mockResolvedValue(shortenedUrl);

            const queryResult = await urlShortenerGraphQlSchemaRoot.getShortenedUrl({longUrl: shortenedUrl.longUrl});
            expect(queryResult).toStrictEqual({
                shortUrlId: "f8a54f2",
                longUrl: "https://example.com/firstShortenedUrl"
            });
        });

        it('returns a resolved promise with null when no existing ShortenedUrls match in the db', async () => {
            const shortenedUrl = {
                shortUrlId: "f8a54f2",
                longUrl: "https://example.com/firstShortenedUrl"
            };
            ShortenedUrls.findOne = jest.fn().mockResolvedValue(null);

            const queryResult = await urlShortenerGraphQlSchemaRoot.getShortenedUrl({longUrl: shortenedUrl.longUrl});
            expect(queryResult).toBe(null);
        });

        it('returns a rejected promise with an error when the query errors', async () => {
            const shortenedUrl = {
                shortUrlId: "f8a54f2",
                longUrl: "https://example.com/firstShortenedUrl"
            };
            ShortenedUrls.findOne = jest.fn().mockRejectedValue("Query error");

            let resultingError;
            try {
                await urlShortenerGraphQlSchemaRoot.getShortenedUrl({invalidQueryProp: shortenedUrl.longUrl} as any);
            } catch (error) {
                resultingError = error;
            }
            expect(resultingError).toBe("Query error");
        });
    });

    describe('createShortenedUrl(args: {input: CreateShortenedUrlInput})', () => {
        describe('when the longUrl has not yet been shortened', () => {
            it('returns a resolved promise with the newly created ShortenedUrl from the db', async () => {
                const longUrl = "https://example.com/firstShortenedUrl";
                ShortenedUrls.findOne = jest.fn().mockResolvedValue(null);

                const queryResult = await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                    input: ({
                        longUrl: longUrl
                    } as CreateShortenedUrlInput)
                });
                expect(queryResult.longUrl).toBe("https://example.com/firstShortenedUrl");
                expect(queryResult.shortUrlId).toBe("f8a54f2");

                expect(ShortenedUrls.findOne).toHaveBeenCalledTimes(2);
                expect(mockGenerateShortenedUrlId).toHaveBeenCalledTimes(1);
                expect(mockSave).toHaveBeenCalledTimes(1);
            });

            it('creates with a unique shortUrlId, re-generating a new one if the generated one has already been used', async () => {
                /**
                 * Note: This test is slow ~1600ms, likely due to the retry timeouts
                 * https://github.com/tim-kos/node-retry/blob/master/lib/retry.js
                 * Consider mocking the timers.
                 */
                const longUrl = "https://example.com/firstShortenedUrl";
                const shortUrlId = "f8a54f2";
                const createdAt = "2022-06-15";
                ShortenedUrls.findOne = jest.fn().mockResolvedValueOnce(null);
                (ShortenedUrls.findOne as any).mockResolvedValueOnce({
                    longUrl: longUrl,
                    shortUrlId: shortUrlId,
                    createdAt: createdAt
                });
                (ShortenedUrls.findOne as any).mockResolvedValueOnce(null);

                const queryResult = await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                    input: ({
                        longUrl: longUrl
                    } as CreateShortenedUrlInput)
                });
                expect(queryResult.longUrl).toBe("https://example.com/firstShortenedUrl");
                expect(queryResult.shortUrlId).toBe("f8a54f2");

                expect(ShortenedUrls.findOne).toHaveBeenCalledTimes(3);
                expect(mockGenerateShortenedUrlId).toHaveBeenCalledTimes(2);
                expect(mockSave).toHaveBeenCalledTimes(1);
            });

            it('returns a rejected promise with an error when the longUrl is not a valid URL', async () => {
                const longUrl = "firstShortenedUrl";
                ShortenedUrls.findOne = jest.fn().mockResolvedValue(null);
    
                let expectedError;
                try {
                    await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                            input: ({
                                longUrl: longUrl
                            } as CreateShortenedUrlInput)
                        });
                } catch(error) {
                    expectedError = error;
                }
                expect(expectedError).toBe("args.input.longUrl is not a valid URL: firstShortenedUrl");

                expect(ShortenedUrls.findOne).not.toHaveBeenCalled();
                expect(mockGenerateShortenedUrlId).not.toHaveBeenCalled();
                expect(mockSave).not.toHaveBeenCalled();
            });

            it('returns a rejected promise with an error when finding an existing entry for the longUrl', async () => {
                const longUrl = "https://example.com/firstShortenedUrl";
                ShortenedUrls.findOne = jest.fn().mockRejectedValue("find one error");
    
                let expectedError;
                try {
                    await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                            input: ({
                                longUrl: longUrl
                            } as CreateShortenedUrlInput)
                        });
                } catch(error) {
                    expectedError = error;
                }
                expect(expectedError).toBe("find one error");

                expect(mockGenerateShortenedUrlId).not.toHaveBeenCalled();
                expect(mockSave).not.toHaveBeenCalled();
            });

            it('returns a rejected promise with an error when there is an error saving the newly shortened url to the db', async () => {
                const longUrl = "https://example.com/firstShortenedUrl";
                ShortenedUrls.findOne = jest.fn().mockResolvedValue(null);
                mockSave.mockRejectedValue("saving error");

                let expectedError;
                try {
                    await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                            input: ({
                                longUrl: longUrl
                            } as CreateShortenedUrlInput)
                        });
                } catch(error) {
                    expectedError = error;
                }
                expect(expectedError).toBe("saving error");
            });
        });

        describe('when the url has previously been shortened', () => {
            it('returns a resolved promise with the existing ShortenedUrl from the db', async () => {
                const longUrl = "https://example.com/firstShortenedUrl";
                const shortUrlId = "f8a54f2";
                const createdAt = "2022-06-15";
                ShortenedUrls.findOne = jest.fn().mockResolvedValue({
                    longUrl: longUrl,
                    shortUrlId: shortUrlId,
                    createdAt: createdAt
                });
    
                const queryResult = await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                    input: ({
                        longUrl: longUrl
                    } as CreateShortenedUrlInput)
                });
                expect(queryResult.longUrl).toBe("https://example.com/firstShortenedUrl");
                expect(queryResult.shortUrlId).toBe("f8a54f2");
                expect(queryResult.createdAt).toBe("2022-06-15");

                expect(mockGenerateShortenedUrlId).not.toHaveBeenCalled();
                expect(mockSave).not.toHaveBeenCalled();
            });
        });

        it('returns a rejected promise with an error when the longUrl is not a valid URL', async () => {
            const longUrl = "firstShortenedUrl";
            ShortenedUrls.findOne = jest.fn().mockResolvedValue(null);

            let expectedError;
            try {
                await urlShortenerGraphQlSchemaRoot.createShortenedUrl({
                        input: ({
                            longUrl: longUrl
                        } as CreateShortenedUrlInput)
                    });
            } catch(error) {
                expectedError = error;
            }
            expect(expectedError).toBe("args.input.longUrl is not a valid URL: firstShortenedUrl");
        });
    });
});
