const { database, addDatabaseCart, getDatabaseCart, databaseOder } = require("./database")
const produtos = require("./produtos.json")

async function verifyGift (req, res, gift) {
    var gifts = await database.ref(`gifts`).once("value")
    var list = gifts.val()
    if(list[gift]) {
        if(req.user) {
            var user = await database.ref(`useds/${req.user.sub}`).once("value") 
            var data = user.val()
            if(data === null || data[gift] === false) return res.json({status: "valid", value: list[gift], message: "cupom aplicado com sucesso"})
            else return res.json({ status: "used", message: "cupom ja utilizado"})
        } else {
            return res.json({status: "valid", value: list[gift], message: "cupom aplicado com sucesso"})
        }
    } else {
        return res.json({ status: "invalid", message: "cupom invalido" })
    }   
}

async function verifyCart(req, res) {
    const queryParams = Object.entries(req.query);
    var params = {}
    queryParams.forEach(([key, value]) => {
        params[key] = value
    });
    var itens = JSON.parse(params.items)
    if(itens.produtos === "nada") return res.json({ status: "error", message: "o carrinho esta vazio" });
    var total = await calcCart(itens, params.cupom, req)
    
    if(!total) {
        res.json({ status: "error", message: "o carrinho esta vazio" })
    }  else {
        addDatabaseCart(req.user.sub, itens, total, params.cupom)
        res.json({ status: "sucess", message: "Adicionado ao banco de dados" })
    }
}

async function calcCart(cart, gift, req) {
    var cartTotal = 0;
    var frete = 30;
    var desc = 0
    cart.forEach((x) => {
        var item = Object.values(produtos).find((b) => b.name === x.nome)
        if(item) cartTotal+=(item.price*x.count)
    })

    if(cartTotal === 0) return;
   
    if(gift) {
        var gifts = await database.ref(`gifts`).once("value")
        if(gifts.val() && gifts.val()[gift]) { 
            if(req.user) {
                var user = await database.ref(`useds/${req.user.sub}`).once("value") 
                if(user.val() === null || !user.val()[gift])  desc+= gifts.val()[gift]
            } else {
                desc+= gifts.val()[gift]
            }
        }   
    } 
    return cartTotal + frete - desc
}

function verifyStock(stock, getcart) {
    for (const produto in getcart) {
        if (getcart[produto] > 0 && !(produto in stock) || getcart[produto] > stock[produto]) {
            return false; 
        }
    }
    return true; 
}

async function buystock(req, res, id) {
    var ref = await database.ref("stock").once("value")
    var stock = ref.val()
    var cart = await getDatabaseCart(id)
    delete cart.cupom;
    delete cart.total;
    if(!verifyStock(stock, cart)) return res.json({status: "outstock", message: "algum dos produtos esta indisponivel"})
    return res.json({status: "instock", message: "produtos estao disponivel", cart: cart, produtos: produtos})
}


async function order(req, res, id, dataid) {
    var cart = await databaseOder(dataid, id)
    var formated = cart.formated
    delete cart.formated
    return { status: "sucess", message: "pedido salvo com sucesso", total: cart.total, cupom: cart.cupom, cart: cart, produtos: produtos, formated: formated }
}

module.exports = { order, buystock, verifyCart, verifyGift }
