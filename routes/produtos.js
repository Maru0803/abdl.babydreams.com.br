const router = require('express').Router();
const Produtos = require('../utils/produtos.json')
const { database } = require("../utils/database.js");
const conteudo = { 
    "loja": {  
         "image": "https://i.imgur.com/EZIoltq.png", 
         "text": "A Baby Dreams Store é a mais recente loja ADBL do brasil, com o objetivo de expandir continuamente e oferecer uma gama cada vez maior de produtos à nossa comunidade, mantendo os preços acessíveis, mesmo para quantidades menores." 
    }, 
    "frete": { 
        "image": "https://i.imgur.com/QJYf6z1.png",
        "text": "Nosso compromisso é com a rapidez na entrega e a segurança dos seus produtos. Utilizamos os Correios como nosso principal meio de envio, garantindo a postagem de encomendas em até três dias úteis após a confirmação do pedido. Pedidos em pré-venda podem ter um prazo de entrega estendido." } 
    },
    "notas": { 
        "image": "https://i.imgur.com/0TEUcmb.png",
        "text": "A Baby Dreams Store, anteriormente operando na plataforma Shopee, possui um histórico comprovado de satisfação do cliente. Mantemos altas taxas de resposta, garantindo que todas as dúvidas de nossos clientes sejam prontamente atendidas."  
    }
}
        
router.get("/", async (req, res) => {
    var ref = await database.ref("stock").once("value")
    var stock = ref.val()

    res.render("produtos", {
        products: Produtos,
        stock: stock,
        conteudo: conteudo
    })
})

module.exports = router;
