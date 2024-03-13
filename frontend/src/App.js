import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:9200/_search?size=100', {
        params: {
          q: "title:" + query,
        },
      });
      setResults(response.data.hits.hits);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-bar"
        />
        <button onClick={search}>Search</button>
        <ol>
          {results.map(result => (
            <li key={result._id}>
              <h2 dangerouslySetInnerHTML={{ __html: highlight(result._source.title, query) }} />
              <img src={result._source.thumbnail_link} alt={result._source.title} />
              <p style={{ fontSize: '12px'}}>{"view count : " + result._source.view_count}</p>
              <p style={{ fontSize: '12px'}}>{"likes : " + result._source.likes}</p>
              <p style={{ fontSize: '12px'}}>{"comment count : " + result._source.comment_count}</p>
              <p style={{ fontSize: '12px'}}>{"published At : " + result._source.publishedAt}</p>
              <p style={{ fontSize: '12px'}} dangerouslySetInnerHTML={{ __html: highlight("published At : " + result._source.description, query) }}></p>
            </li>
          ))}
        </ol>
      </header>
    </div>
  );
}

export default App;