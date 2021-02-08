const express = require('express'),
Task = require('./Model/schema')
const bodyParser = require("body-parser");
var mongoose =require('mongoose'),
reviewd = mongoose.model('reviewSchema');

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/reviewdb',{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set('useFindAndModify', false);
const db = mongoose.connection

app.post('/postReview', async (req, res) => {

    const username = req.body.username;
    const subjectTitle = req.body.subjectTitle;
    const reviewTitle = req.body.reviewTitle;
    const reviewBody = req.body.reviewBody;

    let snippet = {
        username: username,
        date: new Date().toLocaleString().split(',')[0],
        desc: reviewBody.substring(0,100)+"..."      
    }

    let reviews = {
        timeStamp: new Date().toLocaleString().split(',')[0]+" "+new Date().toLocaleString().split(',')[1],
        username: username,
        reviewTitle: reviewTitle,
        review: reviewBody
    }

    if(username === '' || subjectTitle === '' || reviewTitle === '' || reviewBody === ''){
        res.send("Please enter all details.")
    } else {
        var flag = 0;
        
        let resu=await reviewd.find().then(result => {
            return result;
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
    
        for(var i=0;i<resu.length;i=i+1){
            if(resu[i]['subjectTitle'] === subjectTitle){
                var arr = []
                for(var j=0;j<resu[i]['reviews'].length;j++){
                    arr.push(await resu[i]['reviews'][j])
                }
                arr.push(reviews)
                await reviewd.findOneAndUpdate( { subjectTitle: subjectTitle }, { snippet: snippet, reviews: arr } )
                res.send("review updated successfully1")
                flag = 1
                break
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

        if(flag === 0){
            const new_review =new reviewd({
                subjectTitle,
                snippet,
                reviews
            })
            await new_review.save();
            res.send("review updated successfully2")
        }
    }
})

app.get('/getReview', async (req, res) => {

    const revDetails = []
    var flag
    const {subjectTitle} = req.body;
    let resu = await reviewd.find().then(result => {
        return result;
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })

    for(var i=0;i<resu.length;i++){
        if (resu[i]['subjectTitle'].indexOf(subjectTitle)>-1){
            flag = 0;
            revDetails.push(resu[i]['snippet']);
        }
    }
    if(flag != 0) revDetails.push("No items found.");

    res.send(revDetails)
})

app.listen(3000, function(){
    console.log("Server connected to 3000")
})