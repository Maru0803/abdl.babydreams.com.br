const router = require('express').Router();
const Produtos = require('../utils/produtos.json')
const { database } = require("../utils/database.js");

router.get("/", async (req, res) => {
    var ref = await database.ref("stock").once("value")
    var stock = ref.val()

    res.render("produtos", {
        products: Produtos,
        stock: stock,
    })
})

module.exports = router;
