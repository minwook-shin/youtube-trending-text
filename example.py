import multiprocessing
from multiprocessing import Pool
import numpy as np
import pandas as pd
import time
from youtube_trending_text.tokenizer_korean import TokenizerComparison
from youtube_trending_text.extract_data import load_latest_csv_data, select_columns_list, \
    remove_from_default_columns_list


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
    df_split = np.array_split(df, n_cores)
    pool = Pool(n_cores)
    df = pd.concat(pool.map(func, df_split))
    pool.close()
    pool.join()
    return df


def run_tokenizer(df):
    df['konlpy_mecab_title'] = df.index.map(tokenize_konlpy_mecab)
    df['sentencepiece_title'] = df.index.map(tokenize_sentencepiece)
    return df


if __name__ == '__main__':
    # 27595 rows of 252846 rows (removed duplication items)
    latest_data = load_latest_csv_data(duplicates=False)
    removed_columns = [
        'view_count', 'likes', 'dislikes', 'comment_count', 'publishedAt', 'channelTitle', 'tags', 'description'
    ]
    selected_data = select_columns_list(latest_data, remove_from_default_columns_list(removed_columns))
    print(selected_data.count())

    import re

    # emoji pattern
    emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               "]+", flags=re.UNICODE)

    selected_data = selected_data.copy()
    selected_data.loc[selected_data['title'].apply(isinstance, args=(str,)), 'title'] = selected_data[
        'title'].apply(lambda x: emoji_pattern.sub(r'', x) if isinstance(x, str) else x)

    # hangul pattern
    korean_pattern = re.compile('[가-힣]')
    selected_data = selected_data[
        selected_data['title'].apply(lambda x: bool(korean_pattern.search(x)) if isinstance(x, str) else False)]

    # Special characters and symbols pattern
    special_chars_inequality_symbols_pattern = re.compile('[-<>!@#$%^&*(),.?":{}|/]')
    selected_data['title'] = selected_data['title'].apply(
        lambda x: special_chars_inequality_symbols_pattern.sub(' ', x) if isinstance(x, str) else x)

    # Remove rows with title length less than 99 characters
    # for benchmarking purposes
    # selected_data = selected_data[(selected_data['title'].str.len() > 99)].reset_index(drop=True)

    # title indexing
    selected_data.set_index('title', inplace=True, drop=True)
    selected_data = selected_data.drop('video_id', axis=1)
    selected_data = selected_data.drop_duplicates(['title'])

    print(selected_data.count())
    start = time.time()
    result = parallelize_dataframe(selected_data, run_tokenizer)
    end = time.time()
    result.to_csv('./tokenized_title.csv', encoding='utf-8', index=True, header=True)
    print(f"Total Tokenization Time: {end - start} seconds.")
