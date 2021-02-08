var mongoose = require('mongoose')

var reviewSchema = new mongoose.Schema({
    subjectTitle: {
        type:String,
        //required:true
    },
    snippet: {
        type:Map,
        //required:true
    },
    reviews: {
        type:Array,
        required:true
    }
});

module.exports = mongoose.model('reviewSchema', reviewSchema);