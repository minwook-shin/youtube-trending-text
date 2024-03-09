# youtube-trending-text
Extract Text information from popular Korean YouTube videos and visualize popular words (Kookmin University BigData New Technology Undergraduate Project)


## Assignment goal

- Extract and tokenize data from large datasets
  - Select the dataset to be used for the project.
  - Extract data necessary for performing tasks.
  - Compare tokenization work for each data
    - Google sentencePiece tokenizer
    - Huggingface SentencePieceBPETokenizer tokenizer
    - KoNLPy mecab morpheme analyzer
    - KoNLPy KOMORAN morpheme analyzer
    - Niadic custom tokenizer
- Data visualization
  - Visualize data based on the results of data analysis
  - Derive insights based on the results of data visualization

## Used libraries

- pandas
- sentencepiece
  - https://github.com/google/sentencepiece
- tokenizers
  - https://github.com/huggingface/tokenizers/tree/main/bindings/python
- konlpy
  - https://konlpy-ko.readthedocs.io/ko
- mecab
  - https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/
  - ```bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)```

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
    - Niadic custom tokenizer

## Difficulty of Korean Data

Korean - The unit that becomes a space is 'eojul', and eojul tokenization is discouraged in Korean NLP.

Eojul tokenization != Word tokenization

Korean is not composed of independent words, but often has something like a particle attached, which means that all of this must be separated.

A morpheme is the smallest unit of speech that has meaning.

Compared to English-speaking languages, Korean has a difficult and often not well-kept spacing.

## References

- 딥 러닝을 이용한 자연어 처리 입문
  - https://wikidocs.net/book/2155