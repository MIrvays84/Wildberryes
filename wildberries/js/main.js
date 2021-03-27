const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart
const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close')
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
/* получаем нужные элементы*/
const getGoods = async () => {
		const result = await fetch('db/db.json');
		if(!result.ok){
				throw 'error' + result.status
		}
		return await result.json();	
};
/* функция получения товаров */
const cart ={
	cartGoods: [],
	renderCart() {
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count  }) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML =`
				    <td>${name}</td>
						<td>${price}</td>
						<td><button class="cart-btn-minus">-</button></td>
						<td>${count}</td>
						<td><button class="cart-btn-plus">+</button></td>
						<td>${price * count}$</td>
						<td><button class="cart-btn-delete">x</button></td>
			`;	
			cartTableGoods.append(trGood);		
		});
	
		const totalPrice = this.cartGoods.reduce((sum, item) => {
					return sum + item.price * item.count;
		}, 0);

		cardTableTotal.textContent = totalPrice + '$'
		
	},
	deleteGood(id) {
			this.cartGoods = this.cartGoods.filter(item => id !== item.id);
			this.renderCart();
	},
	minusGood(id) {
			for (const item of this.cartGoods) {
				if (item.id === id) {
						if(item.count <= 1) {
							this.deleteGood(id)
						} else {
								item.count--;
						}
						break;
				}
			}
			this.renderCart();
	},
	plusGood(id) {
			for (const item of this.cartGoods) {
				if (item.id === id) {
						item.count++;
						break;
				}
			}
			this.renderCart();
	},
	addCartGoods(id) {
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
						.then(data => data.find(item => item.id === id))
						.then(({ id, name, price }) => {
							this.cartGoods.push({
								id,
								name,
								price,
								count: 1
						});
		   });
	   }
	},
}

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');

	if (addToCart) {
		cart.addCartGoods(addToCart.dataset.id)
	}
})

cartTableGoods.addEventListener('click', event => {
		const target = event.target;
		if (target.tagName === "BUTTON") {
			const id = target.closest('.cart-item').dataset.id;

			  if (target.classList.contains('cart-btn-delete')) {
				cart.deleteGood(id);
				};

		    if (target.classList.contains('cart-btn-minus')) {
				cart.minusGood(id);	
				}

		    if (target.classList.contains('cart-btn-plus')) {
				cart.plusGood(id);
		  	}
		}
		
})

const openModal = () => {
	cart.renderCart();
	modalCart.classList.add('show');
	
};
/* открываем модальное окно */
const closeModal = () => {
	modalCart.classList.remove('show');
};
/* закрываем модальное окно */
buttonCart.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
/*действие при нажатии на кнопки*/

{
	const scrollLink = document.querySelectorAll('a.scroll-link');

	for (let i = 0; i < scrollLink.length; i++) {
		scrollLink[i].addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink[i].getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
		});
	}
}
/*scroll smooth плавная прокрутка goods*/

const createCard = function (objCard) {
		const card = document.createElement('div');
		card.className = 'col-lg-3 col-sm-6';

		card.innerHTML = `
		<div class="goods-card">
						${objCard.label ? 
							`<span class="label">${objCard.label}</span>` :
							 ''}
						
						<img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
						<h3 class="goods-title">${objCard.name}</h3>
						<p class="goods-description">${objCard.description}</p>
						<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
						<span class="button-price">$${objCard.price}</span>
						</button>
					</div>
		`;

		return card;
		/*функция создаёт карточку, добовляет классы, вёрстку, возвращает карточку*/	
};

const renderCards = function(data) {
		longGoodsList.textContent = '';
		const cards = data.map(createCard)
		longGoodsList.append(...cards) 
		document.body.classList.add('show-goods')
};

more.addEventListener('click', event => {
	event.preventDefault();
	getGoods().then(renderCards);
});
/*функция показывающая карточки на странице */

const filterCards = function(field, value) {
		getGoods()
		.then(data => data.filter(good => good[field] === value))
		.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', event => {
		event.preventDefault();
			const field = link.dataset.field;
			const value = link.textContent;
			filterCards(field, value);
	})
});

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
		method: 'POST',
		body: dataUser,
});

modalForm.addEventListener('submit', event => {
		event.preventDefault();

		const formData = new FormData(modalForm);
		formData.append('cart', JSON.stringify(cart.cartGoods))

		postData(FormData)
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status);
				}
				alert('Ваш закзаз успешно отправлен, с вами свяжутся в ближайшее время');
				console.log(response.statusText);
			})
			.catch(err => {
				alert('к сожалению произошла ошибка, повторите попытку позже');
				console.error(err);
			})
			.finally(() => {
				closeModal();
				modalForm.reset();
				cart.cartGoods.length = 0;
			});
});

JSON.stringify(cart.cartGoods)