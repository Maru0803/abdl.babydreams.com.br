const produtos = require("./produtos.json")
const firebase = require("firebase")
require('dotenv').config()

if (!firebase.apps.length) firebase.initializeApp({
    apiKey: process.env.databaseapiKey,
    authDomain: process.env.databaseauthDomain,
    databaseURL: process.env.databasedatabaseURL,
    projectId: process.env.databaseprojectId,
    storageBucket: process.env.databasestorageBucket,
    messagingSenderId: process.env.databasemessagingSenderId,
    appId: process.env.databaseappId,
    measurementId: process.env.databasemeasurementId
});

var database = firebase.database()

async function getDatabaseCart(id) {
    var ref = database.ref(`cart/${id}`)
    var data = await ref.once("value")
    if(data.val() === null) {
        return "error"
    } else {
        var totalcart = 0
        Object.entries(data.val()).forEach(([a, b]) => {
            if(a !== "total")  totalcart += b
        })
        if(totalcart === 0)  return "error";
        return data.val()
    }
}

async function addDatabaseCart(id, info, total, cupom) {
    var ref = database.ref(`cart/${id}`)
    var datacupom = await database.ref(`useds/${id}`).once("value")

    var cart = {}
    Object.entries(produtos).forEach(([a, b]) => {
        var finder = info.find(key => key.nome === b.name);
        if(finder) cart[b.name] = finder.count
        else cart[b.name] = 0
    })
    cart.total = total
    cart.cupom = datacupom.val() === null || !datacupom.val()[cupom] ? cupom : "" 
    ref.set(cart)
    return true
}

async function formatOrder(order, id, data) {
    var datanum = await database.ref("num").once("value")
    var num = datanum.val() === null ? 1 : datanum.val().num + 1
    database.ref("num").set({ num: num })
    database.ref(`orders/${num}`).set({order: order})
    database.ref(`userorders/${id}/${num}`).set(data)
    
    if(data.cupom && data.cupom !== "")  {
       var ref = database.ref(`useds/${id}`)
       var dataref = await ref.once("value")
       if(dataref.val() === null) ref.set({[data.cupom]: true})
       else ref.update({[data.cupom]: true})
    }
    
    delete data.cupom;
    delete data.total;

    var refstock = database.ref("stock")
    var datastock = await refstock.once("value")
    var stock = {}
    Object.entries(data).forEach(([a, b]) => {
        if(b > 0) {
            stock[a] = datastock.val()[a]-=b
        }
    })
    refstock.update(stock)

    return num
}


async function databaseOder(order, id) {
    var data = await getDatabaseCart(id)
    var cupom = data.cupom;
    var total = data.total;
    var formated = await formatOrder(order, id, data);
    database.ref(`cart/${id}`).remove();
    data.formated = formated
    data.cupom = cupom
    data.total = total
    return data
}


module.exports = { addDatabaseCart, getDatabaseCart, database, databaseOder }