import pandas as pd
from util.timer import Timer

def main(df):
  if df is None:
    return

  if __name__ != "__main__":
    print(__name__)
    
  timer = Timer()
  
  columns = [
    "album_release_date",
    "album_name"
  ]
  
  albumsDf = df.filter(items=columns)
  print("Filter columns: ", timer.checkpoint())
  
  albumsDf["album_id"] = range(1, len(albumsDf) + 1)
  
  albumsDf = albumsDf[["album_id", "album_release_date", "album_name"]].drop_duplicates(["album_name"])
  print("Drop duplicates: ", timer.checkpoint())
  
  albumsDf.fillna({"album_name": "[Unnamed album]"}, inplace=True)
  print("Fill NaN values: ", timer.checkpoint())
  
  albumsDf.to_csv('generated/albums.csv', index=False, quotechar='"')
  print("Write to file: ", timer.checkpoint())
  print("Total time: ", timer.timeElapsed())
  print("")
  
  return albumsDf

if __name__ == "__main__":
  df = pd.read_csv('static/Test.csv', quotechar='"', escapechar='\\')
  
  main(df)