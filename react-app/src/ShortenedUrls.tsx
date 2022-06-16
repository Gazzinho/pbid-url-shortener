import { useEffect, useState } from 'react';
import { URL_SHORTENER_SITE_DOMAIN } from './constants';
import { fetchGraphQL, ShortenedUrl } from './graphql';
import { STRINGS } from './strings';

type ShortenedUrlsProps = {
  urlJustShortened: ShortenedUrl | null | undefined
};

type ShortenedUrlTableProps = {
  shortenedUrls: ShortenedUrl[] | null | undefined
};

const FETCH_SHORTENED_URLS_QUERY = `
  query getShortenedUrls {
    getShortenedUrls {
      shortUrlId
      longUrl
    }
  }
`;

function ShortenedUrlTable(props: ShortenedUrlTableProps) {
  if (!props.shortenedUrls?.length) {
    return <p>{STRINGS.EN.shortenedUrlsEmptyTableMessage}</p>;
  }

  const tableRows = props.shortenedUrls.map((shortenedUrl: ShortenedUrl) => {
    const shortUrl = `${URL_SHORTENER_SITE_DOMAIN}${shortenedUrl.shortUrlId}`;
    return (
      <tr key={shortenedUrl.longUrl}>
        <td>
          <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
        </td>
        <td>
          <a href={shortenedUrl.longUrl} target="_blank" rel="noreferrer">{shortenedUrl.longUrl}</a>
        </td>
      </tr>
    );
  });

  return (
    <table className="ShortenedUrls-Table" data-testid="ShortenedUrlsTable">
      <thead>
        <tr>
          <th>{STRINGS.EN.shortenedUrlsTableHeaderShortUrl}</th>
          <th>{STRINGS.EN.shortenedUrlsTableHeaderLongUrl}</th>
        </tr>
      </thead>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  );
}

export function ShortenedUrls(props: ShortenedUrlsProps) {
  const [shortenedUrls, setShortenedUrls] = useState<Array<ShortenedUrl>>([]);
  const [isShortenedUrlsLoading, setIShortenedUrlsLoading] = useState(false);
  const [shortenedUrlsLoadingError, setShortenedUrlsLoadingError] = useState("");

  useEffect(
    () => {
      setIShortenedUrlsLoading(true);
      setShortenedUrlsLoadingError("");
      fetchGraphQL(FETCH_SHORTENED_URLS_QUERY, {})
        .then((response: any) => {
          if (response.errors) {
            setIShortenedUrlsLoading(false);
            setShortenedUrlsLoadingError(STRINGS.EN.shortenedUrlsTableLoadingErrorMessage);
            setShortenedUrls([]);
          } else {
            setShortenedUrls(response.data?.getShortenedUrls || []);
          }
          setIShortenedUrlsLoading(false);
        })
        .catch((error: any) => {
          setShortenedUrlsLoadingError(STRINGS.EN.shortenedUrlsTableLoadingErrorMessage);
        });
    },
    [props.urlJustShortened]
  );

  return (
    <div className="ShortenedUrls" data-testid="ShortenedUrls">
      {isShortenedUrlsLoading ?
        <p>{STRINGS.EN.shortenedUrlsTableLoading}</p>
        : (shortenedUrlsLoadingError ?
            <p>{shortenedUrlsLoadingError}</p>
            : <ShortenedUrlTable shortenedUrls={shortenedUrls} />)}
    </div>
  );
}
