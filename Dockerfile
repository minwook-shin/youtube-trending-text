FROM docker.elastic.co/elasticsearch/elasticsearch:8.12.2

RUN elasticsearch-plugin install analysis-nori

EXPOSE 9200