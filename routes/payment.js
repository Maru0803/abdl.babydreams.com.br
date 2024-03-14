const router = require('express').Router();
const { getDatabaseCart, database } = require("../utils/database.js");
const { stripe } = require("../utils/stripe.js")
require('dotenv').config()

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/checkout');
    }
}

router.get('/', isAuthorized, async (req, res) => {
    if (req.headers.referer.endsWith("checkout")) {
        var getcart = await getDatabaseCart(req.user.sub)
        if (getcart === "error") res.redirect("/checkout")
        else res.render('payment', {
            key: process.env.PublicKey,
            total: getcart.total,
        })
    } else {
      res.redirect("/checkout")
    }
});

router.get("/sucess", isAuthorized, async (req, res) => {
    if (req.headers.referer.endsWith("payment")) {
        res.render('sucess');
    } else {
        res.redirect("/checkout")
    }
});

router.get("/intent", isAuthorized, async (req, res) => {
    var getcart = await getDatabaseCart(req.user.sub)
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "BRL",
            amount: (getcart.total * 100),
            automatic_payment_methods: { enabled: true },
        });
        console.log(paymentIntent.client_secret)
        database.ref(`login/${req.user.sub}`).update({secret: paymentIntent.client_secret})
        res.send({
            clientSecret: "secret ok",
        });
    } catch (e) {
        console.log("[INTENT ERR]: " + e)
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
});


module.exports = router;