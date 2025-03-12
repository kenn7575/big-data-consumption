import pandas as pd
from util.timer import Timer

def main(df):
  if df is None:
    return
  
  if __name__ != "__main__":
    print(__name__)
    
  timer = Timer()

  standardDf = df[['spotify_id', 'artists']].copy().drop_duplicates(["spotify_id"])

  standardDf['artist'] = standardDf['artists'].str.split(', ')
  print("Split columns: ", timer.checkpoint())
    
  standardDf = standardDf.explode('artist')
  print("Explode columns: ", timer.checkpoint())
  
  standardDf = standardDf.drop(columns=['artists'])
  print("Drop columns: ", timer.checkpoint())
  
  standardDf.fillna({ "artist": "[Unnamed artist]" }, inplace=True)
  print("Fill NaN values: ", timer.checkpoint())

  song_artistsDf = standardDf.copy()
  
  song_artistsDf['artist_id'] = pd.factorize(song_artistsDf['artist'])[0] + 1
  print("Factorize artists: ", timer.checkpoint())
  
  song_artistsDf = song_artistsDf.drop(columns=['artist'])
  song_artistsDf.to_csv('generated/song_artists.csv', index=False, quotechar='"')
  print("Write to file: ", timer.checkpoint())
  print("Total time: ", timer.timeElapsed())
  print("")
  
  return song_artistsDf


if __name__ == "__main__":
  df = pd.read_csv('static/Test.csv', quotechar='"', escapechar='\\')

  main(df)