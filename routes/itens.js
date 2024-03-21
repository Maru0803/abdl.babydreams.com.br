const router = require('express').Router();
const Produtos = require('../utils/produtos.json')

var list = Object.entries(Produtos).forEach(([a, b]) => {
    router.get("/" + b.name, (req, res) => {
        res.render("info", {
            name: a,
            data: b,
            conteudo: conteudo
        })
    });
})

module.exports = router;
