var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

//Scraping tools Axios and Cheerio
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });

app.get("/saved", function(req, res) {
    res.sendFile(path.join(__dirname, "public/savedArticles.html"));
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/section/travel").then(function(response) {
    var $ = cheerio.load(response.data);

        let counter = 0;
        app.get("/scrape", function (req, res) {
  
          axios.get("https://www.nytimes.com/section/travel").then(function (response) {
            var $ = cheerio.load(response.data);
           
            $("a.story-link").each(function (i, element) {
              var result = {};
              result.link = $(this).attr("href");
              result.title = $(this).find("h2.headline").text();
              result.summary = $(this).find("p.summary").text();
              db.Article.create(result)
                .then(function (dbArticle) {
                  console.log(dbArticle);
                })
                .catch(function (err) {
                  console.log(err);
                });
            });
            res.send("Scrape Complete");
          });
        });

    res.sendFile(path.join(__dirname, "public/index.html"));
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.put("/articles/:id", function(req, res) {
  db.Article.update({ _id: req.params.id}, {$set: {isSaved: true}})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

  app.delete("/articles/:id", function(req, res) {
    db.Article.remove({ _id: req.params.id})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
