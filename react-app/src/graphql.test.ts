import { fetchGraphQL } from "./graphql";

const DEFAULT_TEST_QUERY = 'some GraphQl query';
const DEFAULT_QUERY_VARIABLES = { a: 'A', b: 'B' };

describe('graphql connection API', () => {
    beforeEach(() => {
        (fetch as any).resetMocks();
    });

    describe('fetchGraphQL(text: string, variables: any)', () => {
        it('returns a promise with the response json for the given GraphQL query text', async () => {
            const expectedResponseJson = {
                data: {
                    getShortenedUrl: {
                        shortUrlId: "asdf",
                        longUrl: "http://example.com"
                    }
                }
            };
            (fetch as any).mockResponseOnce(JSON.stringify(expectedResponseJson));

            const graphQlQueryText = DEFAULT_TEST_QUERY;
            const queryVariables = DEFAULT_QUERY_VARIABLES;
            const responseJson = await fetchGraphQL(graphQlQueryText, queryVariables);

            expect(fetch).toHaveBeenCalledTimes(1);

            const expectedFetchUrl = "http://localhost:8000/graphql";
            const expectedFetchArgs = {
                "body": JSON.stringify({
                    "query": graphQlQueryText,
                    "variables": queryVariables
                }),
                "headers": {
                    "Content-Type": "application/json"
                },
                "method": "POST"
            }
            expect(fetch).toHaveBeenCalledWith(expectedFetchUrl, expectedFetchArgs);
            expect(responseJson).toEqual(expectedResponseJson);
        });

        it('throws an error when there is a connection problem', async () => {
            const expectedErrorMessage = "Cannot connect to API";
            (fetch as any).mockReject(() => Promise.reject(expectedErrorMessage));

            const graphQlQueryText = DEFAULT_TEST_QUERY;
            const queryVariables = DEFAULT_QUERY_VARIABLES;
            await expect(fetchGraphQL(graphQlQueryText, queryVariables)).rejects.toEqual(expectedErrorMessage);

            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });
});
