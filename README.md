# youtube-trending-text
Extract Text information from popular Korean YouTube videos and visualize popular words (Kookmin University BigData New Technology Undergraduate Project)


## Assignment goal

- Extract and tokenize data from large datasets
  - Select the dataset to be used for the project.
  - Extract data necessary for performing tasks.
  - Compare tokenization work for each data
    - Google sentencePiece tokenizer
      - kolang-t5-base(한국어 T5 모델)
      - naver news, mediawiki, Korpora 20GB Data
        - https://github.com/seujung/kolang-t5-base
    - KoNLPy mecab morpheme analyzer
    - KoNLPy KOMORAN morpheme analyzer
- (TODO) Data visualization
  - Visualize data based on the results of data analysis
  - Derive insights based on the results of data visualization

## Used libraries

- `> python3.12`
- pandas
- sentencepiece
  - https://github.com/google/sentencepiece
- konlpy
  - https://konlpy-ko.readthedocs.io/ko
  - ```brew install openjdk@8```
- mecab
  - https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/
  - ```bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)```
  - ```pip install mecab-python3```

## Dataset

YouTube Trending Video Dataset (updated daily)
- https://www.kaggle.com/datasets/rsrishav/youtube-trending-video-dataset
- ```kaggle datasets download -d rsrishav/youtube-trending-video-dataset```
  - period : 2024.03.06

## Data Preprocessing

- Dataset loading
- Dataset filtering
- Dataset tokenization
    - Google sentencePiece
    - Huggingface SentencePieceBPETokenizer
    - KoNLPy mecab
    - KoNLPy KOMORAN

## Difficulty of Korean Data

* Korean - The unit that becomes a space is 'eojul', and eojul tokenization is discouraged in Korean NLP.

* Eojul tokenization != Word tokenization

* Korean is not composed of independent words, but often has something like a particle attached, which means that all of this must be separated.

* A morpheme is the smallest unit of speech that has meaning.

* Compared to English-speaking languages, Korean has a difficult and often not well-kept spacing.

### not well-kept spacing example

* "아버지가방에들어가신다."

```commandline
SentencePiece Tokenization Time: 0.001020193099975586 seconds
['▁아버지가', '방에', '들어', '가', '신', '다', '.']
KoNLPy Mecab Tokenization Time: 0.01869821548461914 seconds
['아버지', '가', '방', '에', '들어가', '신다', '.']
KoNLPy KOMORAN Tokenization Time: 0.012591123580932617 seconds
['아버지', '가방', '에', '들어가', '시', 'ㄴ다', '.']
```

## References

- 딥 러닝을 이용한 자연어 처리 입문
  - https://wikidocs.net/book/2155