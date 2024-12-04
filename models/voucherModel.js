const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2); 
    return `${day}/${month}/${year}`;
}

const voucherSchema = new Schema({
    voucherType: { type: String, required: true },
    voucherCon: { type: String },
    dateAvai: {
        type: Date,
        get: formatDate 
    },
    dateUnVai: {
        type: Date,
        get: formatDate 
    },
    amount: { type: Number },
    trang_thai: { type: Boolean, default: true },
    user_id: { type: ObjectId, ref: 'user' }
}, {
    toJSON: { getters: true }, 
    toObject: { getters: true } 
});

const voucher = mongoose.model('voucher', voucherSchema);

module.exports = mongoose.models.voucher || mongoose.model('voucher', voucher);
