const orderController = {};
const { populate } = require("dotenv");
const Order = require("../models/Order");
const Product = require("../models/Product");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const PAGE_SIZE = 3;
// 먼저  아이템 2개를 카트에 담는다
// 어드민 페이지에간다
// 카트에 담은 아이템중 첫번쨰 아이템은 재고를 0으로  수정
// 두번째 아이템은 남은 재고 기억하기
// 다시 카트페이지로 돌아가 구매진행
// 구매 실패메세지와  어떤 아이템 구매실패했는지  메세지  정확히  유저친화적으로 뜨는지  확인
// 어드민페이지로 돌아간다
// 두번째 아이템의 재고가 그대로 있어야한다 ,  (재고가  줄어들면 실패)
// 다시 정상  시나리오 테스트,
// 결제 완료  후  재고가  줄어드는지 확인
orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    // 재고 확인 (조회 전용)
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems
        .reduce((total, item) => total + item.message + " ", "")
        .trim();
      throw new Error(errorMessage);
    }

    // 주문 생성
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();

    // 주문 확정 후 재고 차감
    for (const item of orderList) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { [`stock.${item.size}`]: -item.qty } }
      );
    }

    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    // 재고 확인 & 재고 업데이트
    const orderList = await Order.find({ userId }).populate("items.productId");

    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: ordernum, $options: "i" } }
      : {};
    let query = Order.find(cond)
      .populate("userId", "email")
      .populate("items.productId", "name");
    let response = { state: "success" };
    const pageNumber = parseInt(page, 10);
    console.log("page:", page, "pageNumber:", pageNumber);

    if (!isNaN(pageNumber) && pageNumber > 0) {
      query = query.skip((pageNumber - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Order.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const order = await query.exec();
    response.data = order;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    // 재고 확인 & 재고 업데이트
    const productId = req.params.id;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      { _id: productId },
      { status },
      { new: true }
    );
    if (!order) throw new Error("item doesn't exist");

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};
module.exports = orderController;
