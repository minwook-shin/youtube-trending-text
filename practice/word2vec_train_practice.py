import ast

import pandas as pd
from gensim.models import word2vec


def get_konlpy_mecab_title(*filenames):
    konlpy_mecab_title_description_list = []
    for filename in filenames:
        df = pd.read_csv(filename, lineterminator='\n')
        konlpy_mecab_title_description_list.extend(df['konlpy_mecab_title'].apply(ast.literal_eval).tolist())
    return konlpy_mecab_title_description_list


def wv_train_tokens(konlpy_mecab_title_list):
    return word2vec.Word2Vec(sentences=konlpy_mecab_title_list, vector_size=300, window=5, min_count=2, workers=4)


if __name__ == "__main__":
    konlpy_mecab_list = get_konlpy_mecab_title("../data/compare_tokenized_origin_title_2024.03.06.csv",
                                               "../data/tokenized_description_2024.03.06.csv")
    model = wv_train_tokens(konlpy_mecab_list)
    model.save("youtube_trending_kr_title_description_2024.03.06.model")
