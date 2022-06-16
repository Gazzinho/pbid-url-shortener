import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Dispatch } from 'react';
import { URL_SHORTENER_SITE_DOMAIN } from './constants';
import { ShortenedUrl } from './graphql';
import { UrlShortener } from './UrlShortener';

const addShortenedUrlMutation = `
  mutation addShortenedUrl($input: CreateShortenedUrlInput!){
    createShortenedUrl(input: $input) {
      longUrl: longUrl
      shortUrlId: shortUrlId
    }
  }
`;

describe('UrlShortener component', () => {
  let mockSetUrlJustShortened: Dispatch<any>;

  beforeEach(() => {
    (fetch as any).resetMocks();
    mockSetUrlJustShortened = jest.fn() as unknown as Dispatch<any>;
  });

  it('renders the URL to shorten input and the Shorten button', async () => {
    render(<UrlShortener urlJustShortened={null} setUrlJustShortened={mockSetUrlJustShortened}/>);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("URL to shorten is invalid")).not.toBeInTheDocument();
    });

    expect(mockSetUrlJustShortened).not.toBeCalled();

    expect(screen.getByTestId("urlToShortenText")).toBeInTheDocument();
    expect(screen.getByTestId("urlToShortenText")).toHaveAttribute("type", "text");
    expect(screen.getByTestId("urlToShortenText")).toHaveAttribute("placeholder", "URL to shorten...");
    expect(screen.getByTestId("urlToShortenText")).toHaveAttribute("aria-label", "Enter the URL to shorten");
    expect(screen.getByTestId("urlToShortenText")).toHaveAttribute("value", "");

    expect(screen.getByTestId("shortenButton")).toBeInTheDocument();
    expect(screen.getByTestId("shortenButton")).toHaveAttribute("type", "submit");
    expect(screen.getByTestId("shortenButton")).toHaveTextContent("Shorten");
    expect(screen.getByTestId("shortenButton")).toHaveAttribute("aria-label", "Activate to shorten the URL");

    await waitFor(() => {
      expect(screen.queryByText("Shortened URL:")).not.toBeInTheDocument();
    });
  });

  it('renders the URL that was just shortened when it is supplied as a prop', async () => {
    const urlJustShortened: ShortenedUrl = {
      longUrl: "https://example.com/qwerty",
      shortUrlId: "7fc17810"
    };
    render(<UrlShortener urlJustShortened={urlJustShortened} setUrlJustShortened={mockSetUrlJustShortened}/>);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("URL to shorten is invalid")).not.toBeInTheDocument();
    });

    expect(mockSetUrlJustShortened).not.toBeCalled();

    expect(screen.getByText("Shortened URL:")).toBeInTheDocument();
    expect(screen.getByTestId("urlJustShortenedLink")).toBeInTheDocument();
    expect(screen.getByTestId("urlJustShortenedLink")).toHaveAttribute("href", `${URL_SHORTENER_SITE_DOMAIN}${urlJustShortened.shortUrlId}`);
    expect(screen.getByTestId("urlJustShortenedLink")).toHaveAttribute("target", "_blank");
    expect(screen.getByTestId("urlJustShortenedLink")).toHaveTextContent(`${URL_SHORTENER_SITE_DOMAIN}${urlJustShortened.shortUrlId}`);
  });

  describe('when the urlToShortenText input has a valid url', () => {
    describe('and the Shorten button is pressed', () => {
      it('posts the URL to be shortened to the server and sets the just shortened url from the response', async () => {
        const expectedShortenedUrl: ShortenedUrl = {
          longUrl: "https://example.com/lkjjlksjdfsjf",
          shortUrlId: "7fc17810"
        };
        const responseData = {
          "data": {
            "createShortenedUrl": expectedShortenedUrl
          }
        };
        (fetch as any).mockResponseOnce(JSON.stringify(responseData));
  
        render(<UrlShortener urlJustShortened={null} setUrlJustShortened={mockSetUrlJustShortened}/>);
  
        fireEvent.change(screen.getByTestId("urlToShortenText"), {
          target: {value: "http://example.com"}
        });
        await waitFor(() => {
          expect(fetchMock).not.toHaveBeenCalled();
        });
  
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
          fireEvent.click(screen.getByTestId("shortenButton"));
          expect(fetchMock).toHaveBeenCalledTimes(1);
          expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/graphql", {
            body: JSON.stringify({
              query: addShortenedUrlMutation,
              variables: {
                input: {
                  longUrl: "http://example.com"
                }
              }
            }),
            headers: {
              "Content-Type": "application/json"
            },
            method: "POST"
          });
        });
  
        expect(mockSetUrlJustShortened).toHaveBeenCalledTimes(1);
        expect(mockSetUrlJustShortened).toHaveBeenCalledWith(expectedShortenedUrl);
  
        await waitFor(() => {
          expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });
  
        await waitFor(() => {
          expect(screen.queryByText("URL to shorten is invalid")).not.toBeInTheDocument();
        });
      });

      it('posts the URL to be shortened to the server and shows an error message when the post fails', async () => {
        const expectedError = {message: "Cannot connect to API"};
        (fetch as any).mockReject(() => Promise.reject(expectedError));

        render(<UrlShortener urlJustShortened={null} setUrlJustShortened={mockSetUrlJustShortened}/>);

        fireEvent.change(screen.getByTestId("urlToShortenText"), {
          target: {value: "http://example.com"}
        });
        await waitFor(() => {
          expect(fetchMock).not.toHaveBeenCalled();
        });

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
          fireEvent.click(screen.getByTestId("shortenButton"));
          expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        expect(mockSetUrlJustShortened).not.toHaveBeenCalled();

        await waitFor(() => {
          expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByText("Cannot connect to API")).toBeInTheDocument();
        });
      });
    });
  });

  describe('when the urlToShortenText input value is not a valid URL', () => {
    it('does nothing when the Shorten button is pressed and the urlToShortenText input value is empty', async () => {
      render(<UrlShortener urlJustShortened={null} setUrlJustShortened={mockSetUrlJustShortened}/>);

      fireEvent.click(screen.getByTestId("shortenButton"));
      await waitFor(() => {
          expect(fetchMock).not.toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("URL to shorten is invalid")).toBeInTheDocument();
      });
    });

    it('does nothing when the Shorten button is pressed and the urlToShortenText input value is invalid', async () => {
      render(<UrlShortener urlJustShortened={null} setUrlJustShortened={mockSetUrlJustShortened}/>);

      screen.getByTestId("urlToShortenText").setAttribute("text", "some non-url string");
      fireEvent.change(screen.getByTestId("urlToShortenText"));
      await waitFor(() => {
        expect(fetchMock).not.toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId("shortenButton"));
      await waitFor(() => {
          expect(fetchMock).not.toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("URL to shorten is invalid")).toBeInTheDocument();
      });
    });
  });

});
