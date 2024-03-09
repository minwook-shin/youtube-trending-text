import subprocess
from pathlib import Path

import pandas as pd
import os

DEFAULT_SELECTED_COLUMNS = [
    'title', 'channelTitle', 'tags', 'description', 'view_count', 'likes', 'dislikes', 'comment_count', 'publishedAt'
]


def __read_csv(file_path):
    subprocess.run(['git', 'lfs', 'checkout', file_path], check=True, stdout=subprocess.DEVNULL)
    return pd.read_csv(file_path, encoding='utf-8', encoding_errors='replace')


def load_latest_csv_data(data_folder_path="data"):
    root = Path(os.path.dirname(os.path.abspath(__file__))).parent.joinpath(data_folder_path)
    csv_file = [file for file in os.listdir(root) if file.startswith("KR") and file.endswith(".csv")]
    latest_csv_file = sorted(csv_file,
                             key=lambda x: pd.to_datetime(x.split('_')[-1].replace(".csv", ""), format="%Y.%m.%d"),
                             reverse=True)
    return __read_csv(root.joinpath(latest_csv_file[0]))


def select_columns_list(data, columns_list=None):
    if columns_list is None:
        columns_list = DEFAULT_SELECTED_COLUMNS
    return data[columns_list]


def remove_from_default_columns_list(columns):
    return [column for column in DEFAULT_SELECTED_COLUMNS if column not in columns]


if __name__ == '__main__':
    latest_data = load_latest_csv_data()
    removed_columns = ['view_count', 'likes', 'dislikes', 'comment_count', 'publishedAt', 'channelTitle']
    selected_data = select_columns_list(latest_data, remove_from_default_columns_list(removed_columns))
    print(selected_data.head())
