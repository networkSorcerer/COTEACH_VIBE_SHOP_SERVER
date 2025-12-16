const cartController = {};
const { populate } = require("dotenv");
const Cart = require("../models/Cart");

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트를 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들어주기
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가 있는 아이템이냐?
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      // 유저가 만든 카트가 없다, 만들어주기}
      throw new Error("아이테이 이미 카트에 담겨 있습니다.");
    }
    // 카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    res.status(200).json({
      status: "success",
      data: cart?.items || [],
      cartItemQty: cart.items.length,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.userId;
    const cart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ status: "fail", error: "Cart not found" });
    }

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateCart = async (req, res) => {
  try {
    const itemId = req.params.id;
    const qty = req.body.qty;
    const userId = req.userId;

    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items._id": itemId }, // userId와 배열 내 아이템 _id 조건
      { $set: { "items.$.qty": qty } }, // 해당 아이템 qty 필드만 업데이트
      { new: true }
    );
    if (!cart) throw new Error("item doesn't exist");

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};
module.exports = cartController;
