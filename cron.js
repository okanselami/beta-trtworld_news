const Xray = require('x-ray');
const async = require('async');
const readPage = require('node-read');
const mongoose = require('mongoose');
const cron = require('node-cron');

const Schema = mongoose.Schema;
 // link model
const linkSchema = new Schema({
  title: String,
  content: String,
});

mongoose.connect('mongodb://localhost/dbtest');

cron.schedule('* * * * *', () => {
  const categories = ['turkey', 'europe', 'mea', 'asia', 'americas', 'business', 'sport', 'art-culture', 'life'];

  for (const category of categories) {
    const LinkSchema = mongoose.model(`${category}`, linkSchema);
    LinkSchema.remove({}).exec();
    const readPagePromise = link => new Promise((resolve, reject) => {
      readPage(link, (err, article) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(article);
      });
    });

    const xray = Xray();

    console.log(`Featured news are fetching from ${category}`);

    async.parallel({
      headline: (callback) => {
        xray(`http://trtworld.com/${category}`, '#headLine a@href')((err, link) => {
          callback(null, link);
        });
      },
      sidebar: (callback) => {
        xray(`http://trtworld.com/${category}`, ['.sidebox a@href'])((err, links) => {
          callback(null, links);
        });
      }
    }, (err, results) => {
      const links = results.sidebar;
      links.unshift(results.headline);

      console.log(`${links.length} links were collected.`);

      const promises = [];

      for (const link of links) {
        promises.push(readPagePromise(link));
      }

      console.log('News details are being fetched...');
      Promise
      .all(promises)
      .then((articles) => {
        const data = articles.map(article => ({
          title: article.title,
          content: article.content
        })
        );
        console.log('News details were fetched.');
        // Save data to database.
        for (let i = 0; i < data.length; i++) {
          const link = new LinkSchema({
            title: data[i].title,
            content: data[i].content,
          });
          link.save((error) => {
            if (error) console.log(error);
            console.log(data[i].title + ' SAVED');
          });
        }
      })
    ;
    });
  }
  console.log('======================================');
  console.log('PROCESS DONE');
});
// const category = process.argv[2] || 'turkey';

