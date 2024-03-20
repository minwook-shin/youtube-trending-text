from gensim.models import Word2Vec


model = Word2Vec.load("youtube_trending_kr_title_description_2024.03.06.model")
print(model.wv.get_vector(u'배우'))
print(model.wv.get_vector(u'여배우'))
print(model.wv.similarity(u'배우', u'여배우'))
print(model.wv.similarity(u'배우', u'남자'))
print(model.wv.similarity(u'남자', u'여배우'))
print(model.wv.most_similar(positive=[u'남자'], topn=5))
print(model.wv.most_similar(positive=[u'남자', u'여배우'], negative=[u'배우'], topn=5))