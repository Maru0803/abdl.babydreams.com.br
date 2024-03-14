/***
 * @author Maru
 * @link https://abdl.babydreams.com.br
 * @copyright Não kibe meu website,
***/

require('./utils/strategies');
const passport = require("passport")
const express = require("express")
const path = require("path")
const session = require("express-session")
const app = express()
const products = require("./utils/produtos.json")
const { database } = require("./utils/database.js");

const verificarOrigem = (req, res, next) => {
    const origin = req.get('host');
    if (origin === 'localhost:3005') {
        next();
    } else {
        res.status(403).send('Acesso Negado');
    }
};


app.use(express.json());
app.use(session({
    secret: 'random',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: 'Baby Dreams Store',
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname + '/public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(verificarOrigem);
const infoRoute = require('./routes/itens');
const authRoute = require('./routes/auth');
const checkoutRoute = require('./routes/checkout');
const produtosRoute = require('./routes/produtos');
const payRoute = require('./routes/payment');
const apisRoute = require('./routes/apis');

app.use('/auth', authRoute)
app.use('/info', infoRoute)
app.use('/checkout', checkoutRoute)
app.use('/lister', produtosRoute)
app.use('/payment', payRoute)
app.use('/apis', apisRoute)

app.get('/', async (req, res) => {
    var ref = await database.ref("stock").once("value")
    var stock = ref.val()

    res.render('home', {
        loged: req.user ? true : false,
        user: req?.user,
        products: products,
        stock: stock,
    })
});


app.get('/loja', async (req, res) => {
    res.render('loja')
});
app.get('/frete', async (req, res) => {
    res.render('frete')
});
app.get('/privacity', async (req, res) => {
    res.render('privacity')
});


app.listen(8080, () => {
    console.log('Online')
});

