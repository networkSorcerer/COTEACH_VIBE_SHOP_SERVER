const mongoose = require("mongoose");
const Product = require("./Product");
const Order = require("./Order");
const Schema = mongoose.Schema;
const orderItemsSchema = Schema(
  {
    orderId: { type: mongoose.ObjectId, ref: Order },
    productId: { type: mongoose.ObjectId, ref: Product },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    size: { type: String, required: true },
  },
  { timestamps: true }
);
orderItemsSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj;
};

const OrderItems = mongoose.model("OrderItems", orderItemsSchema);
module.exports = OrderItems;
