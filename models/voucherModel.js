const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const voucherSchema = new Schema({
    voucher_id:{type:ObjectId},
    voucherInc:{type:Number, AutoIncrement:true},
    voucherType:{type:String},
    voucherCon:{type:String},
    dateAvai:{type:Date},
    dateUnVai:{type:Date},
    amount:{type:Number},
    trang_thai:{type:Boolean,default:true},
    user_id:{type:ObjectId, ref: 'user'}
});



const voucher = mongoose.model('voucher', voucherSchema);


module.exports = mongoose.models.voucher || mongoose.model('voucher', voucher);

