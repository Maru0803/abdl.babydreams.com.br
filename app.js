/***
 * @author Maru
 * @link https://abdl-babydreams.com.br
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
    if (origin === 'www.abdl-babydreams.com.br') {
        next();
    } else {
        res.status(200).send('Acesso Negado');
    }
};

const conteudo = { 
    "loja": {  
         "image": "https://i.imgur.com/EZIoltq.png", 
         "text": "A Baby Dreams Store é a mais recente loja ADBL do brasil, com o objetivo de expandir continuamente e oferecer uma gama cada vez maior de produtos à nossa comunidade, mantendo os preços acessíveis, mesmo para quantidades menores." 
    }, 
    "frete": { 
        "image": "https://i.imgur.com/QJYf6z1.png",
        "text": "Nosso compromisso é com a rapidez na entrega e a segurança dos seus produtos. Utilizamos os Correios como nosso principal meio de envio, garantindo a postagem de encomendas em até três dias úteis após a confirmação do pedido. Pedidos em pré-venda podem ter um prazo de entrega estendido." 
    },
    "notas": { 
        "image": "https://i.imgur.com/0TEUcmb.png",
        "text": "A Baby Dreams Store, anteriormente operando na plataforma Shopee, possui um histórico comprovado de satisfação do cliente. Mantemos altas taxas de resposta, garantindo que todas as dúvidas de nossos clientes sejam prontamente atendidas."  
    }
}


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
app.use(express.static(path.join(__dirname + '/publicc')));

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
        conteudo: conteudo
    })
});

app.get('/privacity', async (req, res) => {
    res.render('privacity', {
        conteudo: conteudo
    })
});

app.get('/sitemap.xml', async (req, res) => {    
    res.sendFile(__dirname + '/public/sitemap.xml');
});

app.listen(8080, () => {
    console.log('Online')
});

