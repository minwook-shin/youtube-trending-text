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
      const response = await axios.get('http://127.0.0.1:9200/_search?size=10', {
        params: {
          source: JSON.stringify({
            "query": {
              "function_score": {
                "query": { "match": { "title": query } },
                "functions": [{
                  "field_value_factor": {
                    "field": "view_count",
                    "modifier": "log1p",
                    "factor": 1.3
                  },// eslint-disable-next-line
                  "field_value_factor": {
                    "field": "likes",
                    "modifier": "log1p",
                    "factor": 1.2
                  },// eslint-disable-next-line
                  "field_value_factor": {
                    "field": "comment_count",
                    "modifier": "log1p",
                    "factor": 1.1
                  }
                }],
                "boost_mode": "multiply"
              }
            }
          }),
          source_content_type: 'application/json'
        }
      });
      setResults(response.data.hits.hits);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>유튜브 한국 인기 동영상 검색 키워드 TOP 10</h1>
        <input
          placeholder='Search for videos...'
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              search();
            }
          }}
          className="search-bar"
          style={{
            width: '60%',
            padding: '12px 20px',
            margin: '8px 0',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '2px solid #ccc',
            transition: '0.5s',
            outline: 'none',
          }}
        />
        <button onClick={search} style={{
          padding: '10px 20px',
          margin: '8px 0',
          boxSizing: 'border-box',
          borderRadius: '4px',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          transition: '0.5s',
          outline: 'none'
        }}>Search</button>
        <ol>
          {results.map(result => (
            <li key={result._id}>
              <h2
                onClick={() => {
                  if (window.confirm('제목을 클립보드에 복사하시겠습니까?')) {
                    navigator.clipboard.writeText(result._source.title);
                  }
                }}
                dangerouslySetInnerHTML={{ __html: highlight(result._source.title, query) }}
              />
              <a href={`https://www.youtube.com/watch?v=${result._source.video_id}`} target="_blank" rel="noopener noreferrer">
                <img src={result._source.thumbnail_link} alt={result._source.title} />
              </a>
              <p style={{ fontSize: '14px' }}>{"match score : " + result._score}</p>
              <p style={{ fontSize: '12px' }}>{"view count : " + result._source.view_count}</p>
              <p style={{ fontSize: '12px' }}>{"likes : " + result._source.likes}</p>
              <p style={{ fontSize: '12px' }}>{"comment count : " + result._source.comment_count}</p>
              <p style={{ fontSize: '12px' }}>{"published At : " + result._source.publishedAt}</p>
            </li>
          ))}
        </ol>
      </header>
    </div>
  );
}

export default App;