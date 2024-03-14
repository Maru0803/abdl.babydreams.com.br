const router = require('express').Router();
const { order, buystock, verifyCart, verifyGift } = require("../utils/apis.js");
const { database } = require("../utils/database.js");
require('dotenv').config();
const Produtos = require('../utils/produtos.json')

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/auth');
    }
}

router.get('/verifygift', async (req, res) => {
    var gift = req.query.gift
    verifyGift(req, res, gift)
});

router.get('/stock', async (req, res) => {
    var stock = await database.ref("stock").once("value")
    res.json(stock.val());
});

router.get('/verify', isAuthorized, async (req, res) => {
    verifyCart(req, res)
});

router.get('/buystock', isAuthorized, async (req, res) => {
    var id = req.user.sub
    buystock(req, res, id)
});

router.get('/orders', isAuthorized, async (req, res) => {
    var id = req.user.sub
    var dataid = req.query.dataid
    var data = await order(req, res, id, dataid)
    res.json(data)
    
});

router.get('/public', isAuthorized, async (req, res) => {
    res.send({
        publishableKey: process.env.PublicKey,
    });
});

router.get('/secret', isAuthorized, async (req, res) => {
    var ref = await database.ref(`login/${req.user.sub}`).once("value")
    var secret = ref.val().secret
    res.send({
        clientSecret: secret,
    });
});
router.get('/produtos', async (req, res) => {
    res.json({produtos: Produtos})
})

module.exports = router;
