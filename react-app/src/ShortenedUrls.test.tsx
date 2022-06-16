import { render, screen, waitFor } from '@testing-library/react';
import { URL_SHORTENER_SITE_DOMAIN } from './constants';
import { ShortenedUrl } from './graphql';
import { ShortenedUrls } from './ShortenedUrls';

const EMPTY_RESPONSE_DATA = {
  data: {
    getShortenedUrls: []
  }
};

describe('ShortenedUrls component', () => {
  let responseDataWithShortenedUrls: any;
  let firstShortenedUrl: ShortenedUrl;

  beforeEach(() => {
    (fetch as any).resetMocks();

    firstShortenedUrl = {
      shortUrlId: "f8a54f2",
      longUrl: "https://example.com/firstShortenedUrl"
    };

    responseDataWithShortenedUrls = {
      data: {
        getShortenedUrls: [
          firstShortenedUrl
        ] as Array<ShortenedUrl>
      }
    };
  });

  describe('when the data response is empty (has no ShortenedUrls)', () => {
    it('renders the empty message', async () => {
      (fetch as any).mockResponseOnce(JSON.stringify(EMPTY_RESPONSE_DATA));

      render(<ShortenedUrls urlJustShortened={null}/>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("No URLs have been shortened yet... Be the first!")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId("ShortenedUrlsTable")).not.toBeInTheDocument();
      });
    });
  });

  describe('when the data response has ShortenedUrls', () => {
    it('renders the ShortenedUrls table', async () => {
      (fetch as any).mockResponseOnce(JSON.stringify(responseDataWithShortenedUrls));

      render(<ShortenedUrls urlJustShortened={null}/>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText("No URLs have been shortened yet... Be the first!")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId("ShortenedUrlsTable")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Short URL")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Long URL")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}f8a54f2`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/firstShortenedUrl")).toBeInTheDocument();
      });
    });

    it('fetches the ShortenedUrls data when props.urlJustShortened is updated', async () => {
      (fetch as any).mockResponseOnce(JSON.stringify(responseDataWithShortenedUrls));

      const { rerender } = render(<ShortenedUrls urlJustShortened={null}/>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText("No URLs have been shortened yet... Be the first!")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId("ShortenedUrlsTable")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}f8a54f2`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/firstShortenedUrl")).toBeInTheDocument();
      });

      expect((fetch as any)).toHaveBeenCalledTimes(1);

      const justShortened: ShortenedUrl = {
        shortUrlId: "b873cbf4",
        longUrl: "https://example.com/secondShortenedUrl"
      };
      responseDataWithShortenedUrls.data.getShortenedUrls.push(justShortened);
      (fetch as any).mockResponseOnce(JSON.stringify(responseDataWithShortenedUrls));

      rerender(<ShortenedUrls urlJustShortened={justShortened}/>);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect((fetch as any)).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        expect(screen.getByTestId("ShortenedUrlsTable")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}f8a54f2`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/firstShortenedUrl")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}b873cbf4`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/secondShortenedUrl")).toBeInTheDocument();
      });
    });
  });

  describe('when the data response has errors', () => {
    it('renders the loading data error message', async () => {
      const responseData = {
        errors: [{message: "Cannot connect to API"}]
      };
      (fetch as any).mockResponseOnce(JSON.stringify(responseData));

      render(<ShortenedUrls urlJustShortened={null}/>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText("No URLs have been shortened yet... Be the first!")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId("ShortenedUrlsTable")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Error loading Shortened URLs")).toBeInTheDocument();
      });
    });

    it('fetches the ShortenedUrls data when props.urlJustShortened is updated', async () => {
      (fetch as any).mockResponseOnce(JSON.stringify(responseDataWithShortenedUrls));

      const { rerender } = render(<ShortenedUrls urlJustShortened={null}/>);

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText("No URLs have been shortened yet... Be the first!")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId("ShortenedUrlsTable")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}f8a54f2`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/firstShortenedUrl")).toBeInTheDocument();
      });

      expect((fetch as any)).toHaveBeenCalledTimes(1);

      const justShortened: ShortenedUrl = {
        shortUrlId: "b873cbf4",
        longUrl: "https://example.com/secondShortenedUrl"
      };
      responseDataWithShortenedUrls.data.getShortenedUrls.push(justShortened);
      (fetch as any).mockResponseOnce(JSON.stringify(responseDataWithShortenedUrls));

      rerender(<ShortenedUrls urlJustShortened={justShortened}/>);

      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      expect((fetch as any)).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}f8a54f2`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/firstShortenedUrl")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${URL_SHORTENER_SITE_DOMAIN}b873cbf4`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("https://example.com/secondShortenedUrl")).toBeInTheDocument();
      });
    });
  });

});
