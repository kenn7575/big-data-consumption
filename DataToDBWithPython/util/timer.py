import time

class Timer:
    def __init__(self):
        self.start_time = time.time()
        self.checkpoints = []
        self.decimals = 3
  
    def elapsedSinceCheckpoint(self, index = -1):
        if (len(self.checkpoints) == 0):
            return self.timeElapsed()
      
        return round(time.time() - self.checkpoints[index], self.decimals)
  
    def timeElapsed(self):
        return round(time.time() - self.start_time, self.decimals)
      
    def checkpoint(self):
        self.checkpoints.append(time.time())
      
        if (len(self.checkpoints) == 1):
            return self.timeElapsed()
      
        return round(self.checkpoints[-1] - self.checkpoints[-2], self.decimals)

    def reset(self):
        self.start_time = time.time()
        self.checkpoints = []