const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const userSchema = new Schema({
    id:{type:ObjectId},
    username:{type:String},
    password:{type:String},
});



const user = mongoose.model('user', userSchema);

module.exports = mongoose.models.user || mongoose.model('user', user);

