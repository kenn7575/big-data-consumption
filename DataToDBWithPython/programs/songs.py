import pandas as pd
from util.timer import Timer

def main(df):
  if df is None:
    return

  if __name__ != "__main__":
    print(__name__)

  timer = Timer()
  
  songColumns = [
    "spotify_id",
    "name",
    "is_explicit",
    "duration_ms",
    "danceability",
    "energy",
    "key",
    "loudness",
    "mode",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "time_signature"
  ]

  songsDf = df.filter(items=songColumns + ["album_name"])
  print("Filter columns: ", timer.checkpoint())
  
  songsDf = songsDf.drop_duplicates(["spotify_id"])
  print("Drop duplicates: ", timer.checkpoint())

  songsDf.fillna({ "name": "[Unnamed song]" }, inplace=True)
  print("Fill NaN values: ", timer.checkpoint())

  albumsDf = pd.read_csv('generated/albums.csv', quotechar='"')
  print("Read albums data: ", timer.checkpoint())

  songsDf = songsDf.merge(albumsDf[['album_id', 'album_name']], on='album_name', how='left')
  print("Merge with albums: ", timer.checkpoint())
  
  songsDf = songsDf.drop(columns=['album_name'])
  print("Drop album_name column: ", timer.checkpoint())

  songsDf['name'] = songsDf['name'].str.replace("'", "''")
  print("Replace single quotes: ", timer.checkpoint())

  songsDf.to_csv('generated/songs.csv', index=False, doublequote=True, escapechar=None)     
  print("Write to file: ", timer.checkpoint())
  print("Total time: ", timer.timeElapsed())
  print("")
  
  return songsDf


if __name__ == "__main__":
  df = pd.read_csv('static/Test.csv', quotechar='"', escapechar='\\')

  main(df)