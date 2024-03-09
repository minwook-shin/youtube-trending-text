import multiprocessing
from multiprocessing import Pool
import numpy as np
import pandas as pd
import time
from youtube_trending_text.tokenizer_korean import TokenizerComparison
from youtube_trending_text.extract_data import load_latest_csv_data, select_columns_list, \
    remove_from_default_columns_list

latest_data = load_latest_csv_data()
removed_columns = [
    'view_count', 'likes', 'dislikes', 'comment_count', 'publishedAt', 'channelTitle', 'tags', 'description'
]
selected_data = select_columns_list(latest_data, remove_from_default_columns_list(removed_columns))


def tokenize_sentencepiece(text):
    if isinstance(text, str):
        tokenizer = TokenizerComparison(text)
        return tokenizer.sentencepiece()
    else:
        return []


def tokenize_konlpy_mecab(text):
    if isinstance(text, str):
        tokenizer = TokenizerComparison(text)
        return tokenizer.konlpy_mecab()
    else:
        return []


def parallelize_dataframe(df, func, n_cores=multiprocessing.cpu_count()):
    df_split = np.array_split(df, n_cores)  # core의 개수만큼 df를 나눔
    pool = Pool(n_cores)  # pool을 core개수만큼 생성
    df = pd.concat(pool.map(func, df_split))  # 나누어진 df를 func을 적용해서 수행 및 concat
    pool.close()
    pool.join()  # 모두 완료될 때까지 대기
    return df


def run_tokenizer(df):
    df['sentencepiece_title'] = df['title'].apply(lambda x: tokenize_sentencepiece(x))
    df['konlpy_mecab_title'] = df['title'].apply(lambda x: tokenize_konlpy_mecab(x))
    return df


if __name__ == '__main__':
    print(selected_data.count())
    start = time.time()
    parallelize_dataframe(selected_data, run_tokenizer)
    selected_data.to_json(r'tokenized_title.json')
    end = time.time()
    logger.info(f"Total Tokenization Time: {end - start} seconds.")
