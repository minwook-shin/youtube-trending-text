# introduce the csv data

import pandas as pd

df = pd.read_csv('data/KR_youtube_trending_data_2024.03.06.csv', lineterminator='\n')

print(df.size)

print(df.head())

df_int = df.describe().astype(int)
print(df_int.to_string())

print(df.dtypes)

print(df.isnull().sum())
