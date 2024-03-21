import json
from functools import wraps

from flask import Flask, Response
from gensim.models import Word2Vec

from youtube_trending_text.tokenizer_korean import TokenizerComparison

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Add CORS headers to the response after each request."""
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


def as_json(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        res = f(*args, **kwargs)
        res = json.dumps(res, ensure_ascii=False).encode('utf8')
        return Response(res, content_type='application/json; charset=utf-8')

    return decorated_function


@app.route('/<word>', methods=['GET'])
@as_json
def get_word(word):
    model = Word2Vec.load("../practice/youtube_trending_kr_title_description_2024.03.06.model")
    try:
        data = model.wv.most_similar(positive=word, topn=3)
        return [item[0] for item in data]

    except KeyError:
        tokenizer = TokenizerComparison(word)
        words = tokenizer.konlpy_mecab()
        data = model.wv.most_similar(positive=words, topn=3)
        return [item[0] for item in data]


if __name__ == '__main__':
    app.run(debug=True)
