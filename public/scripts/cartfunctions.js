var sidebar = false;
var menuside = false;
var stock;

window.addEventListener('load', () => {
    fetch(`/apis/stock`, {
        method: 'GET',
    }).then(response => {
        return response.json();
    })
    .then(data => {
       stock = data
    })
    .catch(error => {
        console.log("[CART FUNCTIONS]", error)
    });
});

function openMenu() {
    if (menuside === false) {
        document.getElementById("menuSidebar").style.width = "400px";
        displayCartItems();
        menuside = true
        if(sidebar) {
            sidebar = false
            document.getElementById("cartSidebar").style.width = "0";
        }
    } else {
        document.getElementById("menuSidebar").style.width = "0";
        menuside = false
    }

}

function openCart() {
    if (sidebar === false) {
        document.getElementById("cartSidebar").style.width = "400px";
        displayCartItems();
        sidebar = true
        if(menuside) {
            menuside = false
            document.getElementById("menuSidebar").style.width = "0";
        }
    } else {
        document.getElementById("cartSidebar").style.width = "0";
        sidebar = false
    }

}

function adicionarAoCarrinho(nomeProduto, precoProduto) {
    let carrinhoDeCompras = carregarCarrinhoDoLocalStorage();
    const index = carrinhoDeCompras.findIndex(item => item.nome === nomeProduto);
    const count = index === -1 ? 0 : carrinhoDeCompras[index].count
    if (stock[nomeProduto] > count) {
        if (index !== -1) {
            carrinhoDeCompras[index].count++;
        } else {
            carrinhoDeCompras.push({
                nome: nomeProduto,
                preco: precoProduto,
                count: 1
            });
        }
        updateCartTotal();
        salvarCarrinhoNoLocalStorage(carrinhoDeCompras);
        let modal = document.getElementById("addModal");
        modal.style.display = "block";
  
        if (sidebar === true) {
            document.getElementById("cartSidebar").style.width = "400px";
            displayCartItems();
        }
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        let modal = document.getElementById("limitModal");
        modal.style.display = "block";
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}
  
function increaseQuantity(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (itemId !== -1) {
        if (stock[cartItems[itemId].nome] > cartItems[itemId].count) { 
            cartItems[itemId].count++;
            localStorage.setItem("carrinhoDeCompras", JSON.stringify(cartItems));
            try {
                displayCartItems();
            } catch (err) {
                displayItems()
            }
        } else {
            let modal = document.getElementById("limitModal");
            modal.style.display = "block";
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
    }
}
  
function decreaseQuantity(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (itemId !== -1 && cartItems[itemId].count > 1) {
        cartItems[itemId].count--;
        localStorage.setItem("carrinhoDeCompras", JSON.stringify(cartItems));
        try {
            displayCartItems();
        } catch (err) {
            displayItems()
        }
    }
}

const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        let informations = button.closest('.produto').querySelector('h3')
        let datainfo = JSON.parse(informations.getAttribute('data-info'));
        const produto = {
            nome: datainfo.nome,
            preco: datainfo.preco
        };
       
        adicionarAoCarrinho(produto.nome, produto.preco);
    });
});


function salvarCarrinhoNoLocalStorage(carrinho) {
    localStorage.setItem('carrinhoDeCompras', JSON.stringify(carrinho));
}

function carregarCarrinhoDoLocalStorage() {
    const carrinhoSalvo = localStorage.getItem('carrinhoDeCompras');
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
}

async function displayCartItems() {
    updateCartTotal();
    const { produtos } = await fetch('/apis/produtos').then(r => r.json())
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let cartItemsContainer = document.getElementById("cartItems");
    cartItemsContainer.innerHTML = "";

    if (cartItems && cartItems.length > 0) {
        cartItems.forEach((i, index) => {
            var item = produtos[i.nome]
            let itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.description}">
                <div class="item-details">
                    <p>${item.names[0]}</p>
                    <p>R$ ${item.price} - {item.count[0]}</p>
                </div>
                <div class="item-quantity">
                    <button class="btn-add" onclick="decreaseQuantity(${index})">-</button>
                    <span>${i.count}</span>
                    <button class="btn-add" onclick="increaseQuantity(${index})">+</button>
                    <button class="delete-button" onclick="deleteItem(${index})">x</button>
                </div>
                
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        updateCartTotal();
    } else {
        cartItemsContainer.innerHTML = "<p>Nenhum item no carrinho</p>";
    }
}

function deleteItem(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let updatedCartItems = cartItems.filter((item, index) => index !== itemId);
    localStorage.setItem("carrinhoDeCompras", JSON.stringify(updatedCartItems));
    try {
        displayCartItems();
    } catch(err) {
        displayItems()
    }
}

const giftButton = document.querySelector('.giftcode-section button');
const giftInput = document.querySelector('.giftcode-section input');
let successMessage = document.querySelector('.giftcode-section .success-message');
let errorMessage = document.querySelector('.giftcode-section .error-message');

giftButton.addEventListener('click', () => {
    const cupom = giftInput.value;
  
    fetch(`/apis/verifygift?gift=${cupom}`, {
        method: 'GET'
    }).then(response => {
        return response.json();  
    })
    .then(data => {
        if(data.status === "invalid") throw new Error("invalid")
        if(data.status === "used") throw new Error("used")
        updateCartTotal(data.value);
        if (!successMessage) {
            successMessage = document.createElement('p');
            successMessage.className = 'success-message';
            giftButton.parentNode.appendChild(successMessage);
        }
        successMessage.textContent = 'Cupom aplicado com sucesso';
        successMessage.style.color = 'green';

        if (errorMessage) {
            errorMessage.remove();
            errorMessage = null;
        }
    })
    .catch(error => {
        let message = error.message === "used" ? "Cupom ja utilizado" : "Algo deu errado" 
        if (!errorMessage) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'error-message';
            giftButton.parentNode.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';

        if (successMessage) {
            successMessage.remove();
            successMessage = null;
        }
    });

});

function updateCartTotal(data) {
    let cartTotal = 0;
    let frete = 30;
    if (data) {
        let desconto = data;
        document.getElementById("cartGift").textContent = desconto.toFixed(2);
    }
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (cartItems && cartItems.length > 0) {
        cartItems.forEach(function (item) {
            cartTotal += (item.preco * item.count);
        });
    }
    document.getElementById("cartProduto").textContent = (cartTotal).toFixed(2)
    let desconto = parseFloat(document.getElementById("cartGift").textContent);
    document.getElementById("cartTotal").textContent = (cartTotal + frete - desconto).toFixed(2);
}

function gerarQueryString(localStore) {
    const queryParams = [];
    const produtos = {};

    localStore.forEach(item => {
        produtos[item.nome] = item.count;
    });

    for (const produto in produtos) {
        if (produtos.hasOwnProperty(produto)) {
            queryParams.push(`${encodeURIComponent(produto)}=${encodeURIComponent(produtos[produto])}`);
        }
    }

    return queryParams.join('&');
}
