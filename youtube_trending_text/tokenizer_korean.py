import time

import transformers
from konlpy.tag import Mecab, Komoran
from transformers import T5Tokenizer
import logging

transformers.logging.set_verbosity_error()

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

logger.addHandler(console_handler)


class TokenizerComparison:
    def __init__(self, text):
        self.text = text
        self.hf_sp_bpe = T5Tokenizer.from_pretrained('digit82/kolang-t5-base')
        self.mecab = Mecab()
        self.ko_moran = Komoran()

    def sentencepiece(self, timer=False):
        if timer:
            start = time.time()
            tokens = self.hf_sp_bpe.tokenize(self.text)
            end = time.time()
            logger.debug(f"SentencePiece Tokenization Time: {end - start} seconds : {tokens}")
        else:
            tokens = self.hf_sp_bpe.tokenize(self.text)
            logger.debug(f"SentencePiece Tokenization : {tokens}")
        return tokens

    def konlpy_mecab(self, timer=False):
        if timer:
            start = time.time()
            tokens = self.mecab.morphs(self.text)
            end = time.time()
            logger.debug(f"KoNLPy Mecab Tokenization Time: {end - start} seconds : {tokens}")
        else:
            tokens = self.mecab.morphs(self.text)
            logger.debug(f"KoNLPy Mecab Tokenization : {tokens}")
        return tokens

    def konlpy_komoran(self, timer=False):
        if timer:
            start = time.time()
            tokens = self.ko_moran.morphs(self.text)
            end = time.time()
            logger.debug(f"KoNLPy KOMORAN Tokenization Time: {end - start} seconds : {tokens}")
        else:
            tokens = self.ko_moran.morphs(self.text)
            logger.debug(f"KoNLPy KOMORAN Tokenization : {tokens}")
        return tokens


if __name__ == "__main__":
    sample_text = "아버지가방에들어가신다."
    tokenizer_comparison = TokenizerComparison(sample_text)
    tokenizer_comparison.sentencepiece(timer=True)
    tokenizer_comparison.konlpy_mecab(timer=True)
    tokenizer_comparison.konlpy_komoran(timer=True)
