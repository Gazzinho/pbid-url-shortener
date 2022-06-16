import { Dispatch, useState } from "react";
import { URL_SHORTENER_SITE_DOMAIN } from "./constants";
import { fetchGraphQL, ShortenedUrl } from "./graphql";
import { STRINGS } from "./strings";

const addShortenedUrlMutation = `
  mutation addShortenedUrl($input: CreateShortenedUrlInput!){
    createShortenedUrl(input: $input) {
      longUrl: longUrl
      shortUrlId: shortUrlId
    }
  }
`;

type UrlShortenerProps = {
    urlJustShortened: ShortenedUrl | null | undefined,
    setUrlJustShortened: Dispatch<any>
};

export function UrlShortener(props: UrlShortenerProps) {
    const [urlToShorten, setUrlToShorten] = useState("");
    const [isShorteningInProgress, setIsShorteningInProgress] = useState(false);
    const [shorteningError, setShorteningError] = useState("");

    function handleSubmit(event: any) {
        event.preventDefault();

        let urlToShortenUrl;
        try {
            if (urlToShorten && urlToShorten.length) {
                urlToShortenUrl = new URL(urlToShorten);
            }
            if (typeof urlToShortenUrl === 'undefined' || !urlToShortenUrl) {
                setShorteningError(STRINGS.EN.urlShortenerUrlToShortenInvalidMessage);
                return;
            }
        } catch(error: any) {
            setShorteningError(STRINGS.EN.urlShortenerUrlToShortenInvalidMessage);
            return;
        }

        try {
            setIsShorteningInProgress(true);
            setShorteningError("");
            fetchGraphQL(addShortenedUrlMutation, {
                input: {longUrl: urlToShorten}
            })
                .then((response: any) => {
                    props.setUrlJustShortened(response.data?.createShortenedUrl);
                    setIsShorteningInProgress(false);
                })
                .catch((error: any) => {
                    setShorteningError(error.message);
                    setIsShorteningInProgress(false);
                });
        } catch(error: any) {
            setShorteningError(error.message);
        } finally {
            setIsShorteningInProgress(false);
        }
    }

    return (
        <div className="UrlShortener" data-testid="UrlShortener">
            <form onSubmit={(event) => handleSubmit(event)}>
                <input
                    data-testid="urlToShortenText"
                    type="text"
                    placeholder={STRINGS.EN.urlShortenerInputPlaceholder}
                    aria-label={STRINGS.EN.urlShortenerInputAriaLabel}
                    value={urlToShorten}
                    onChange={e => setUrlToShorten(e.target.value)}
                />
                <button
                    data-testid="shortenButton"
                    type="submit"
                    aria-label={STRINGS.EN.urlShortenerSubmitButtonAriaLabel}
                >{STRINGS.EN.urlShortenerSubmitButtonLabel}</button>
            </form>
            <div>
                {(isShorteningInProgress || shorteningError) ?
                    ((isShorteningInProgress
                        && STRINGS.EN.urlShortenerShorteningInProgressMessage)
                        || shorteningError
                        || null)
                    : (props.urlJustShortened
                        && <div>
                            <div>{STRINGS.EN.urlShortenerShortenedUrlLabel}</div>
                            <div><a
                            data-testid="urlJustShortenedLink"
                            href={`${URL_SHORTENER_SITE_DOMAIN}${props.urlJustShortened.shortUrlId}`}
                            target="_blank"
                            rel="noreferrer"
                        >{`${URL_SHORTENER_SITE_DOMAIN}${props.urlJustShortened.shortUrlId}`}</a></div>
                    </div>)}
            </div>
        </div>
    );
}

