import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('PrimaryBid URL Shortener App component', () => {
  let responseData: any;

  beforeEach(() => {
    (fetch as any).resetMocks();

    responseData = {
      data: {
        getShortenedUrls: [
          {
            longUrl: "https://example.com/qwerty",
            shortUrlId: "7fc17810"
          }
        ]
      }
    };
  });
  
  it('renders the page title/header, the URL Shortener and the list of shortened URLs', async () => {
    (fetch as any).mockResponseOnce(JSON.stringify(responseData));
  
    render(<App />);
  
    await waitFor(() => {
      expect(document.title).toBe("PBID URL Shortener");
    });
  
    const headerElement = screen.getByText(/PrimaryBid URL Shortener/i);
    expect(headerElement).toBeInTheDocument();
  
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("UrlShortener")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("ShortenedUrls")).toBeInTheDocument();
    });
  });
});

