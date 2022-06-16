import React, { useEffect, useState } from 'react';
import './App.css';
import { ShortenedUrls } from './ShortenedUrls';
import { STRINGS } from './strings';
import { UrlShortener } from './UrlShortener';

function App() {
  const [urlJustShortened, setUrlJustshortened] = useState(null);

  useEffect(() => {
    document.title = STRINGS.EN.appDocumentTitle;
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {STRINGS.EN.appHeaderText}
        </p>
      </header>
      <div className="App-body">
        <UrlShortener
          setUrlJustShortened={setUrlJustshortened}
          urlJustShortened={urlJustShortened}/>
        <ShortenedUrls urlJustShortened={urlJustShortened}/>
      </div>
    </div>
  );
}

export default App;
