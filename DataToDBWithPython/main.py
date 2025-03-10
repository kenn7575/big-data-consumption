import pandas as pd
import sys, os
from programs import artists, song_artists, songs, albums, records
from util.timer import Timer
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

localhost = os.getenv('localhost')
columnar = os.getenv('columnar')
raspPi = os.getenv('raspPi')

testMode = "--test" in sys.argv or "-t" in sys.argv

engine = create_engine(localhost)

def __main__():
  os.system('clear')
  timer = Timer()
  
  if not os.path.exists("./generated"):
    os.makedirs("./generated")
  
  if testMode:
    df = pd.read_csv('static/Test.csv', quotechar='"', escapechar='\\')
  else:
    df = pd.read_csv('static/Top_spotify_songs.csv', quotechar='"', escapechar='\\')
  
  print("Read file: ", timer.checkpoint())
  
  albumsDF = albums.main(df)
  artistsDF = artists.main(df)
  
  songsDF = songs.main(df)
  
  song_artistsDF = song_artists.main(df)
  recordsDF = records.main(df)
  
  if testMode == False:
    albumsDF.to_sql("albums", engine, if_exists='append', index=False)
    print("Added Albums to the database: ", timer.checkpoint())

    artistsDF.to_sql("artists", engine, if_exists='append', index=False)
    print("Added Artists to the database: ", timer.checkpoint())

    song_artistsDF.to_sql("song_artists", engine, if_exists='append', index=False)
    print("Added Song_Artists to the database: ", timer.checkpoint())
          
    songsDF.to_sql("songs", engine, if_exists='append', index=False)
    print("Added Songs to the database: ", timer.checkpoint())

    recordsDF.to_sql("records", engine, if_exists='append', index=False)
    print("Added Records to the database: ", timer.checkpoint())

  print("Total time: ", timer.timeElapsed())
  
if __name__ == "__main__":
  __main__()