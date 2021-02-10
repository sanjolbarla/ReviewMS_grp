const express = require("express"),
  Task = require("./Model/schema");
const bodyParser = require("body-parser");
const cors = require("cors");
var mongoose = require("mongoose"),
  reviewd = mongoose.model("reviewSchema");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/reviewdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useFindAndModify", false);
const db = mongoose.connection;

app.post("/postReview", async (req, res) => {
  const username = req.body.username;
  const subjectTitle = req.body.subjectTitle;
  const reviewTitle = req.body.reviewTitle;
  const reviewBody = req.body.reviewBody;
  console.log(req.body);

  let snippet = {
    subjectTitle: subjectTitle,
    username: username,
    date: new Date().toLocaleString().split(",")[0],
    desc: reviewBody.substring(0, 100) + "...",
  };

  let reviews = {
    timeStamp:
      new Date().toLocaleString().split(",")[0] +
      " " +
      new Date().toLocaleString().split(",")[1],
    username: username,
    reviewTitle: reviewTitle,
    review: reviewBody,
  };

  if (
    username === "" ||
    subjectTitle === "" ||
    reviewTitle === "" ||
    reviewBody === ""
  ) {
    const createFailure = {
      status: "error",
      message: "Something went wrong",
    };
    res.send(JSON.stringify(createFailure));
  } else {
    var flag = 0;

    let resu = await reviewd
      .find()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });

    for (var i = 0; i < resu.length; i = i + 1) {
      if (resu[i]["subjectTitle"] === subjectTitle) {
        var arr = [];
        for (var j = 0; j < resu[i]["reviews"].length; j++) {
          arr.push(await resu[i]["reviews"][j]);
        }
        arr.push(reviews);
        await reviewd.findOneAndUpdate(
          { subjectTitle: subjectTitle },
          { snippet: snippet, reviews: arr }
        );
        const createSuccess = {
          status: "Success",
          message: "Review Created Succesfully!",
        };
        res.send(JSON.stringify(createSuccess));
        flag = 1;
        break;
      }
    }

    /*await reviewd.find({ subjectTitle: subjectTitle }, async function(err, data){
            if(err) throw err;
            var arr = []
            //console.log(data);
            arr.push(await data[0]['reviews'].find(r => {return r;}))
            console.log(arr);
            arr.push(reviews)
            //console.log(arr)
            //await reviewd.findOneAndUpdate( { subjectTitle: subjectTitle }, { snippet: snippet, reviews: arr } )
            res.send("review updated successfully1")
            flag = 1
        })*/

    if (flag === 0) {
      const new_review = new reviewd({
        subjectTitle,
        snippet,
        reviews,
      });
      await new_review.save();
      // res.send("review updated successfully2");
      const createSuccess = {
        status: "Success",
        message: "Review Created Succesfully!",
      };
      res.send(JSON.stringify(createSuccess));
    }
  }
});

app.post("/getReview", async (req, res) => {
  console.log(req.body);
  const revDetails = [];
  var flag;
  const { subjectTitle } = req.body;
  let resu = await reviewd
    .find()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });

  for (var i = 0; i < resu.length; i++) {
    if (resu[i]["subjectTitle"].indexOf(subjectTitle) > -1) {
      flag = 0;
      revDetails.push(resu[i]["snippet"]);
    }
  }
  if (flag != 0) {
    //    revDetails.push("No items found.");
    res.send({ status: "error", error: "No items found" });
  } else {
    const snippetReview = {
      status: "Success",
      snippets: revDetails,
    };

    res.send(JSON.stringify(snippetReview));
  }
});

app.post("/getFullReview", async (req, res) => {
  const revDetails = [];
  var flag;
  const { subjectTitle } = req.body;
  let resu = await reviewd
    .find()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });

  for (var i = 0; i < resu.length; i++) {
    if (resu[i]["subjectTitle"].indexOf(subjectTitle) > -1) {
      flag = 0;
      revDetails.push(resu[i]["reviews"]);
    }
  }
  if (flag != 0) {
    res.send({ status: "error", error: "No items found" });
    // revDetails.push("No items found.");
  } else {
    const fullReview = {
      status: "Success",
      review: revDetails,
    };
    // console.log(JSON.stringify(fullReview));
    res.send(JSON.stringify(fullReview));
  }
});

app.listen(8000, function () {
  console.log("Review Micoservice is running on 8000");
});
