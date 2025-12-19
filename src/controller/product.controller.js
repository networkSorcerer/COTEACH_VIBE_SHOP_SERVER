const Product = require("../models/Product");
const PAGE_SIZE = 5;
const productController = {};
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    let productSku = await Product.findOne({ sku });
    if (productSku) {
      throw new Error("이미 존재하는 식별 코드 입니다.");
    }

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();

    // 성공 응답 추가
    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name, menu } = req.query;

    // 조건 만들기
    let cond = {};
    if (name) {
      cond.name = { $regex: name, $options: "i" }; // 이름 검색
    }
    // menu가 있고, "전체"가 아닐 때만 category 필터 적용
    if (menu && menu !== "ALL") {
      cond.category = menu;
    }

    let query = Product.find(cond);
    let response = { state: "success" };
    const pageNumber = parseInt(page, 10);
    console.log("page:", page, "pageNumber:", pageNumber);

    if (!isNaN(pageNumber) && pageNumber > 0) {
      query = query.skip((pageNumber - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, category, description, price, stock, status },
      { new: true }
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId); // 이렇게만 해도 OK
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.detailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId); // 이렇게만 해도 OK
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStock = async (item) => {
  // item: { productId, size, qty } 형태로 받는다고 가정
  const product = await Product.findById(item.productId);
  if (!product) {
    return { isVerify: false, message: "상품을 찾을 수 없습니다." };
  }

  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
    };
  }

  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];

  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item); //
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems; // 부족한 항목 리스트 반환
};

module.exports = productController;
