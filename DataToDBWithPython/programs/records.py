import pandas as pd
from util.timer import Timer

def main(df):
  if df is None:
    return
  
  if __name__ != "__main__":
    print(__name__)
    
  timer = Timer()
  
  recordColumns = [
    "spotify_id",
    "daily_rank",
    "daily_movement",
    "weekly_movement",
    "country",
    "snapshot_date",
    "popularity"
  ]
  
  recordsDf = df[recordColumns].copy()
  print("Copy columns: ", timer.checkpoint())
  
  recordsDf.insert(0, 'record_id', range(1, len(recordsDf) + 1))
  print("Add record_id column: ", timer.checkpoint())
  
  recordsDf.to_csv('generated/records.csv', index=False, quotechar='"')
  print("Write to file: ", timer.checkpoint())
  print("Total time: ", timer.timeElapsed())
  print("")
  
  return recordsDf


if __name__ == "__main__":
  df = pd.read_csv('static/Test.csv', quotechar='"', escapechar='\\')

  main(df)