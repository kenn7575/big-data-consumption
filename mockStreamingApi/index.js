const express = require("express");
const cors = require("cors");
const { Readable } = require("stream");

const app = express();
const port = 5050;

app.use(cors());

const data = [
  { date: "2000-01-01", name: "Blinding Lights", value: 72537 },
  { date: "2000-01-01", name: "Shape of You", value: 65421 },
  { date: "2000-01-01", name: "Dance Monkey", value: 59087 },
  { date: "2000-01-01", name: "Someone You Loved", value: 53942 },
  { date: "2000-01-01", name: "One Dance", value: 47826 },
  { date: "2000-02-01", name: "Blinding Lights", value: 78234 },
  { date: "2000-02-01", name: "Dance Monkey", value: 67321 },
  { date: "2000-02-01", name: "Shape of You", value: 63987 },
  { date: "2000-02-01", name: "Someone You Loved", value: 52145 },
  { date: "2000-02-01", name: "One Dance", value: 48967 },
  { date: "2000-03-01", name: "Dance Monkey", value: 83456 },
  { date: "2000-03-01", name: "Blinding Lights", value: 81234 },
  { date: "2000-03-01", name: "Shape of You", value: 62879 },
  { date: "2000-03-01", name: "One Dance", value: 49321 },
  { date: "2000-03-01", name: "Someone You Loved", value: 51098 },
  { date: "2000-04-01", name: "Dance Monkey", value: 89764 },
  { date: "2000-04-01", name: "Blinding Lights", value: 83567 },
  { date: "2000-04-01", name: "One Dance", value: 57892 },
  { date: "2000-04-01", name: "Shape of You", value: 61234 },
  { date: "2000-04-01", name: "Someone You Loved", value: 50123 },
  { date: "2000-05-01", name: "Dance Monkey", value: 82764 },
  { date: "2000-05-01", name: "Blinding Lights", value: 86567 },
  { date: "2000-05-01", name: "One Dance", value: 47892 },
  { date: "2000-05-01", name: "Shape of You", value: 66234 },
  { date: "2000-05-01", name: "Someone You Loved", value: 30123 },
];

app.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  const uniqueDates = [...new Set(data.map(d => d.date))];

  for (const date of uniqueDates) {
    const chunk = data.filter(d => d.date === date);
    res.write(JSON.stringify(chunk) + "\n");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  res.end();
});

app.listen(port, () => {
  console.log(`Streaming API running at http://localhost:${port}`);
});
