# dataset

YouTube Trending Video Dataset (updated daily)
- https://www.kaggle.com/datasets/rsrishav/youtube-trending-video-dataset

## prebuilt data

include data/archive_2024.03.06

## Download Newly data

using kaggle cli with python

```text
export KAGGLE_USERNAME=datadinosaur
export KAGGLE_KEY=xxxxxxxxxxxxxx
```

```bash
pip install kaggle
kaggle datasets download rsrishav/youtube-trending-video-dataset -f KR_youtube_trending_data.csv -p data
```

and unzip the downloaded file.
    
```bash 
unzip data/KR_youtube_trending_data.csv.zip -d data
```

## tokenization

- koNLPy mecab
- title, description
- description tokenization time : 6609.0457 seconds (AMD 7600 + SSD)

## License

CC0: Public Domain