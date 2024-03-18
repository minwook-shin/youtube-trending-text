import React, { useState } from 'react';
import axios from 'axios';
import { CssBaseline, Container, Typography, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Switch from '@mui/material/Switch';



function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [isBoostingEnabled, setIsBoostingEnabled] = useState(false);

  const handleToggle = () => {
    setIsBoostingEnabled(!isBoostingEnabled);
  };


  const toggleDetails = (id) => {
    setShowDetails(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };

  const search = async () => {
    const search_query = isBoostingEnabled ? {
      "function_score": {
        "query": {
          "multi_match": {
            "query": query,
            "fields": ["title", "description"]
          }
        },
        "functions": [
          {
            "field_value_factor": {
              "field": "view_count",
              "modifier": "log1p",
              "factor": 1.3
            }
          },
          {
            "field_value_factor": {
              "field": "likes",
              "modifier": "log1p",
              "factor": 1.2
            }
          },
          {
            "field_value_factor": {
              "field": "comment_count",
              "modifier": "log1p",
              "factor": 1.1
            }
          },
          {
            "gauss": {
              "publishedAt": {
                "origin": new Date().toISOString(),
                "scale": "360d",
                "offset": "30d",
                "decay": 0.5
              }
            }
          }
        ],
        "boost_mode": "multiply"
      }
    } : {
      "multi_match": {
        "query": query,
        "fields": ["title", "description"]
      }
    };

    const response = await axios.get('http://127.0.0.1:9200/_search?size=10', {
      params: {
        source: JSON.stringify({ "explain": true, "query": search_query }),
        source_content_type: 'application/json'
      }
    });
    setResults(response.data.hits.hits);

  };

  return (
    <div className="App">
      <CssBaseline />
      <Container>
        <Grid container spacing={2}>
          <Grid fullWidth xs={12}>
            <Typography component="h1" variant="h4">유튜브 한국 인기 동영상 검색 키워드 TOP 10</Typography>
            부스팅 : <Switch defaultChecked checked={isBoostingEnabled} onChange={handleToggle} />
            <TextField fullWidth id="standard-basic" label="Search for videos..." variant="standard" onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  search();
                }
              }} />
            <Button fullWidth variant="outlined" onClick={search}>Search</Button>
          </Grid>
          <Grid fullWidth xs={12}>
            {results.map(result => (
              <Card sx={{ display: 'flex' }} key={result._id}>
                <a href={`https://www.youtube.com/watch?v=${result._source.video_id}`} target="_blank" rel="noopener noreferrer">
                  <CardMedia
                    component="img"
                    image={result._source.thumbnail_link}
                    alt="green iguana"
                  />
                </a>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" onClick={() => {
                    if (window.confirm('제목을 클립보드에 복사하시겠습니까?')) {
                      navigator.clipboard.writeText(result._source.title);
                    }
                  }}
                    dangerouslySetInnerHTML={{ __html: highlight(result._source.title, query) }}>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"match score : " + result._score}
                    <button onClick={() => toggleDetails(result._id)}>
                      {showDetails[result._id] ? 'Close' : 'Search Explain'}
                    </button>
                    {showDetails[result._id] && (
                      <pre style={{ fontSize: '10px' }}>
                        {"score explain : " + JSON.stringify(result._explanation, null, 2)}
                      </pre>
                    )} <br />
                    {"view count : " + result._source.view_count} <br />
                    {"likes : " + result._source.likes} <br />
                    {"comment count : " + result._source.comment_count} <br />
                    {"published At : " + result._source.publishedAt}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;