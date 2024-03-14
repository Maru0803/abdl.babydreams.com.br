window.addEventListener('load', () => {
    displayItems()
});

function verifycart() {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (!cartItems || cartItems.length === 0) {
        let modal = document.getElementById("nullCart");
        modal.style.display = "block";
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        return true
    }
    return false
}

const nextButton = document.querySelector('.next-section button');

if (nextButton) nextButton.addEventListener('click', function () {

    const cupom = giftInput.value;
    let cartItems = localStorage.length > 0 ? localStorage.getItem("carrinhoDeCompras") : JSON.stringify({"produtos": "nada"});
    let data = {
        items: cartItems,
        cupom: cupom
    }

    fetch(`/apis/verify?` + gerarQueryData(data), {
        method: 'GET',
    }).then(response => {
        return response.json();
    })
    .then(res => {
        if(res.status === "error") {
            verifycart()
        } else {
            window.location.href = '/payment';
        }
    })
    .catch(error => {
        console.log("[CHECKOUT PAGE]", error)
    });
});

async function displayItems() {
    const { produtos } = await fetch('/apis/produtos').then(r => r.json())
    updateCartTotal();
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let cartItemsContainer = document.getElementById("cartItems");
    cartItemsContainer.innerHTML = "";

    if (cartItems && cartItems.length > 0) {
        cartItems.forEach((item, index) => {
              var item = produtos[i.nome]
            let itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.description}">
                <div class="item-details">
                    <p>${item.names[0]}</p>
                    <p>R$ ${item.preco}</p>
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

function gerarQueryData(produtos) {
    const queryParams = []
    for (const produto in produtos) {
        if (produtos.hasOwnProperty(produto)) {
            queryParams.push(`${encodeURIComponent(produto)}=${encodeURIComponent(produtos[produto])}`);
        }
    }
    return queryParams.join('&');
}
