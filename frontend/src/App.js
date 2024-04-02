import React, { useState } from 'react';
import axios from 'axios';
import { CssBaseline, Container, Typography, Button, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Switch from '@mui/material/Switch';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Slider } from '@mui/material';


function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [isBoostingEnabled, setIsBoostingEnabled] = useState(false);

  const [apiResult, setApiResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewCountFactor, setViewCountFactor] = useState(1.3);
  const [likesFactor, setLikesFactor] = useState(1.2);
  const [commentCountFactor, setCommentCountFactor] = useState(1.1);

  const [gaussScale, setGaussScale] = useState(360);
  const [gaussOffset, setGaussOffset] = useState(30);
  const [gaussDecay, setGaussDecay] = useState(0.5);

  const handleToggle = () => {
    setIsBoostingEnabled(!isBoostingEnabled);
  };

  const search_similar = async (video_id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/${video_id}`);
      if (response.data.length === 0) {
        setError('결과가 없습니다.');
      } else {
        setApiResult(response.data);
      }
    } catch (error) {
      setError('API 호출 중 오류가 발생했거나, 없는 단어입니다.');
    }
    setIsLoading(false);
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
              "factor": viewCountFactor
            }
          },
          {
            "field_value_factor": {
              "field": "likes",
              "modifier": "log1p",
              "factor": likesFactor
            }
          },
          {
            "field_value_factor": {
              "field": "comment_count",
              "modifier": "log1p",
              "factor": commentCountFactor
            }
          },
          {
            "gauss": {
              "publishedAt": {
                "origin": new Date().toISOString(),
                "scale": gaussScale + "d",
                "offset": gaussOffset + "d",
                "decay": gaussDecay
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
    search_similar(query);
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
              <Typography gutterBottom>View Count Factor</Typography>
            <Slider value={viewCountFactor} min={0.01} max={2} step={0.01} onChange={(e, newValue) => setViewCountFactor(newValue)} valueLabelDisplay="on" />
            <Typography gutterBottom>Likes Factor</Typography>
            <Slider value={likesFactor} min={0.01} max={2} step={0.01} onChange={(e, newValue) => setLikesFactor(newValue)} valueLabelDisplay="on" />
            <Typography gutterBottom>Comment Count Factor</Typography>
            <Slider value={commentCountFactor} min={0.01} max={2} step={0.01} onChange={(e, newValue) => setCommentCountFactor(newValue)} valueLabelDisplay="on" />
            <Typography gutterBottom>Gauss Decay</Typography>
            <Slider value={gaussDecay} min={0.1} max={0.8} step={0.01} onChange={(e, newValue) => setGaussDecay(newValue)} valueLabelDisplay="on" />
            <Typography gutterBottom>Gauss Scale (days)</Typography>
            <Slider value={gaussScale} min={1} max={720} step={1} onChange={(e, newValue) => setGaussScale(newValue)} valueLabelDisplay="on" />
            <Typography gutterBottom>Gauss Offset (days)</Typography>
            <Slider value={gaussOffset} min={0} max={360} step={1} onChange={(e, newValue) => setGaussOffset(newValue)} valueLabelDisplay="on"/>
            <Button fullWidth variant="outlined" onClick={search}>Search</Button>
            {isLoading ? (
              <p>유사 단어를 추출하고 있습니다...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Similar Keyword</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiResult.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index}</TableCell>
                        <TableCell>{item}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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
                    {"published At : " + result._source.publishedAt} <br />
                    {"인기 동영상 등록이 " + result._source.video_count + "회 진행된 영상입니다."}
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