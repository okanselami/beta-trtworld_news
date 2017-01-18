const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dbtest');

const NewsSchema = new mongoose.Schema({
  title: String,
  content: String
});

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

app.get('/category/:id', (req, res) => {
  const category = req.params.id;
  const newsSchema = mongoose.model(`${category}`, NewsSchema);
  newsSchema.find((err, news) => {
    if (err) console.log(err);
    if (news.length === 0) {
      res.json({ Warning: 'Wrong Request' });
    } else {
      res.json(news);
    }
  });
});

app.listen(3000, () => {
  /* eslint-disable */
  console.log('api is running on port 3000');
  /* eslint-enable */
});
