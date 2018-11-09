var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;
var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var databaseUri = 'mongodb://localhost/week18day3mongoose';
if (process.env.MONGODB_URI) {
mongoose.connect(process.env.MONGODB_URI);
}else {
  mongoose.connect(databaseUri);
}

var db = mongoose.connection;
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});
db.once('open', function() {
  console.log('Mongoose connection successful');
});
app.get("/scrape", function (req, res) {
  axios.get("https://10bestquotes.com")
    .then(function (response) {

      var $ = cheerio.load(response.data);

      $("h2").each(function (i, element) {
        var result = {};
        console.log('hi')
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
        result.summary = $(this)
          .children("a")
          .text();
        result.grid = $(this)
          .children("a")
          .attr("href");
        console.log(result);
        db.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            return res.json(err);
          });
      });

      res.send("Scrape Complete");
    });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.get("/articles/:id", function (req, res) {

  db.Article
    .findById( req.params.id )
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.status(500).json(err);
    });
});

app.get("")

app.post("/articles/:id", function (req, res) {

  db.Note
    .create(req.body)
    .then(function (dbNote) {
      return db.Article
      .findOneAndUpdate(req.params.id,
    {$set:  {note: dbNote._id }}, { new: true })
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
