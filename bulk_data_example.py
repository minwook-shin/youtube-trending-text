import elasticsearch
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
# from sentence_transformers import SentenceTransformer

from youtube_trending_text.extract_data import load_latest_csv_data

# 27595 rows of 252846 rows (removed duplication items)
df = load_latest_csv_data(duplicates=False)
df = df.fillna('')
# model = SentenceTransformer('snunlp/KR-SBERT-V40K-klueNLI-augSTS')
# df['vector'] = df['title'].apply(lambda x: model.encode(x).tolist())


es = Elasticsearch(hosts=['http://localhost:9200'])
index_settings = {
    "settings": {
        "analysis": {
            "tokenizer": {
                "korean_nori_tokenizer": {
                    "type": "nori_tokenizer",
                    "decompound_mode": "mixed"
                }
            },
            "analyzer": {
                "nori_analyzer": {
                    "type": "custom",
                    "tokenizer": "korean_nori_tokenizer",
                    "filter": ["nori_posfilter", "nori_readingform"]
                }
            },
            "filter": {
                "nori_posfilter": {
                    "type": "nori_part_of_speech",
                    "stoptags": [
                        "E", "IC", "J", "MAG", "MAJ",
                        "MM", "SP", "SSC", "SSO", "SC",
                        "SE", "XPN", "XSA", "XSN", "XSV",
                        "UNA", "NA", "VSV"
                    ]
                },
            }
        }
    },
    "mappings": {
        "properties": {
            "title": {
                "type": "text",
                "analyzer": "nori_analyzer"
            },
            "description": {
                "type": "text",
                "analyzer": "nori_analyzer"
            },
            "title_vector": {
                "type": "dense_vector",
                "dims": 128
            }
        }
    }
}

try:
    es.indices.delete(index='youtube_trending_kr')
except elasticsearch.NotFoundError:
    pass

es.indices.create(index='youtube_trending_kr', body=index_settings)

documents = df.to_dict(orient='records')
bulk(es, documents, index='youtube_trending_kr', raise_on_error=True)
