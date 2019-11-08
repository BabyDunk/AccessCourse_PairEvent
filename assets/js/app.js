const Pair_Event = {
	storage: {
		store: (key, data) => {
			if (typeof (Storage) !== "undefined") {
				return localStorage.setItem(key, data)
			} else {
				console.log('Storage not available')
			}
		},
		get: (key) => {
			if (typeof (Storage) !== "undefined") {
				return localStorage.getItem(key)
			} else {
				console.log("Storage not available")
			}
		},
		remove: (key) => {
			if (typeof (Storage) !== "undefined") {
				return localStorage.removeItem(key)
			} else {
				console.log("Storage not available")
			}
		},
	},
	utils: {
		scrollDown: (el) => {
			let speed = 10;
			let actionScroll = setInterval(moveScroll, 1);
			
			function moveScroll() {
				let to = document.scrollingElement;
				let stopper = document.querySelector(el.hash).offsetTop;
				stopper = Math.floor(stopper /= speed) * speed;
				
				let mover = to.scrollTop;
				mover = Math.floor(mover /= speed) * speed;
				
				let bottomStop = (Math.floor((to.scrollHeight - to.clientHeight) / speed) * speed);
				
				if (mover === bottomStop) {
					document.scrollingElement.scrollTop -= speed;
					clearInterval(actionScroll);
				} else if (mover < stopper) {
					document.scrollingElement.scrollTop += speed;
				} else if (mover > stopper) {
					document.scrollingElement.scrollTop -= speed;
				} else if (mover === stopper) {
					clearInterval(actionScroll);
				}
			}
		},
		countUp: (el) => {
			let number = parseInt(el.dataset.totalAttendees);
			let numberSec = 1;
			let timer = (numberSec * 1000);
			let timerParts = (timer / number); // Time in milliseconds
			let climber = 0;
			let secClimber = 0;
			
			if (isNaN(number)) {
				console.log('Counter is not a number');
				return ''
			} else {
				
				let climberInterval = setInterval(() => {
					
					secClimber += timerParts;
					climber++;
					
					if (secClimber >= timer) {
						clearInterval(climberInterval)
					}
					el.innerText = climber;
					
				}, (timerParts))
				
			}
		},
		isEmail: (email) => {
			var newRegEx = new RegExp(/^[a-zA-Z0-9!#$%&'*+\-\/=?^_`{|]{1,64}@[a-zA-Z0-9-]{1,253}\.(?:[a-zA-Z]{2,9}\.[a-zA-Z]{2,20}|[a-zA-Z]{2,20})$/m);
			
			return newRegEx.test(email);
		},
		buildCart: (cartItemObject, addOrRemove) => {
			// TODO: Build this out to deal with adding and removing items from the shopping cart
			
			if(item){
				let randomNumber = Math.floor(Math.random()* Math.min(1000000) + Math.min(100000));
				
				let completeOrderObject  = {
					orderId: `orderID-${randomNumber}`,
					orderItems: [],
					orderTotal: 0,
					dateOfPurchase: new Date()
				};
			}
			
			if (addOrRemove !== undefined) {
				console.dir(cartItemObject)
			} else {
				
				console.log('remove from')
			}
			Pair_Event.utils.verifyOrder(cartItemObject)
		},
		verifyOrder: (itemObject) => {
			let verifyPrice = Pair_Event.holders.priceList()[itemObject.id];
			if (verifyPrice !== undefined) {
				
				return verifyPrice.price;
				
			} else {
				console.log('Item not recognised');
				return false
			}
			
		}
	},
	holders: {
		priceList: () => {
			// Simulate backend server price verification checks
			prices = {
				
				1: {
					price: 100
				},
				2: {
					price: 100,
				},
				3: {
					price: 100
				},
				4: {
					price: 100,
				}
			};
			
			
			return prices
		}
		
	}
	
	
};


// Close Modals
(function () {
	
	'use strict';
	
	let whichToClose = document.querySelectorAll('.modal figure .close');
	
	for (let x = 0; x < whichToClose.length; x++) {
		whichToClose[x].addEventListener('click', (evt) => {
			let This = evt.target;
			This.parentElement.parentElement.parentElement.style.display = 'none';
		})
	}
	
})();

// Initial Popup
(function () {
	
	'use strict';
	
	Pair_Event.storage.remove('initial_popup');
	if (Boolean(Pair_Event.storage.get('initial_popup')) !== true) {
		setTimeout(() => {
			document.getElementById('initial_popup').style.display = 'grid';
			//Pair_Event.storage.store('initial_popup', true);
		}, 2000)
	}
	
	
})();

// Open Modals
(function () {
	
	'use strict';
	
	let whichToOpen = document.querySelectorAll('.opener');
	
	for (let x = 0; x < whichToOpen.length; x++) {
		whichToOpen[x].addEventListener('click', (evt) => {
			evt.preventDefault();
			evt = evt.target;
			document.getElementById(evt.dataset.modalType).style.display = 'grid'
		})
	}
})();

// Countdown
(function () {
	
	'use strict';
	
	let target_date = new Date('2019-12-25 13:00');
	
	setInterval(() => {
		
		let current_date = new Date().getTime();
		let date_distance = target_date - current_date;
		
		let days = Math.floor(date_distance / (1000 * 60 * 60 * 24));
		let hours = Math.floor((date_distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((date_distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((date_distance % (1000 * 60)) / 1000);
		
		
		let html = `<section class='counter'>`;
		html += `<figure class='counter_days'>${days}\nDays</figure>`;
		html += `<figure class='counter_hours'>${hours}\nHours</figure>`;
		html += `<figure class='counter_minutes'>${minutes}\nMinutes</figure>`;
		html += `<figure class='counter_seconds'>${seconds}\nSecs</figure>`;
		html += `</section>`;
		
		let countdownClocks = document.querySelectorAll('.countdown');
		
		for (let x = 0; x < countdownClocks.length; x++) {
			countdownClocks[x].innerHTML = html;
		}
		
	}, 1000)
	
})();

// Open tech info modal
(function () {
	
	'use strict';
	
	let techInfoOpener = document.getElementById('tech_info_modal_opener');
	
	techInfoOpener.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		document.getElementById('tech_info_modal').style.display = 'grid'
	})
	
})();

// Open basket modal
// TODO Complete the cart
(function () {
	
	'use strict';
	
	let open_Cart = document.querySelector('.basket_opener');
	
	open_Cart.addEventListener('click', (evt) => {
		
		evt = evt.target;
		document.getElementById(evt.dataset.modalType).style.display = 'grid';
		
		Pair_Event.holders.cart_n_glide = new Glide('#shop_baskets', {
			type: 'slider',
			autoplay: false,
			animationDuration: 2000,
			perView: 1,
			hoverpause: false,
			keyboard: false
		}).mount();
		
		Pair_Event.holders.cart_n_glide.disable();
		Pair_Event.holders.cart_n_glide.enable()
		
	});
})();

// Close basket
// TODO: add more action for when the shopping cart close without completion
(function () {
	
	'use strict';
	
	let close_cart = document.querySelectorAll('.basket_close');
	let basket_modal = document.getElementById('shop_baskets');
	for (let x = 0; x < close_cart.length; x++) {
		close_cart[x].addEventListener('click', (evt) => {
			basket_modal.style.display = 'none'
		})
	}
	
})();

// Scroll to home
(function () {
	
	'use strict';
	
	let showHome = document.getElementById('home');
	showHome.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		Pair_Event.utils.scrollDown(showHome)
	})
	
})();

// Scroll to top
(function () {
	
	'use strict';
	
	let showHome = document.getElementById('scrollTop');
	showHome.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		Pair_Event.utils.scrollDown(showHome)
	})
	
})();

// Scroll to email reminder
(function () {
	
	'use strict';
	
	let showHome = document.getElementById('getReminder');
	showHome.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		Pair_Event.utils.scrollDown(showHome)
	})
	
})();

// Scroll to theExperts
(function () {
	
	'use strict';
	
	let showExperts = document.getElementById('meet_the_experts_opener');
	showExperts.addEventListener('click', (evt) => {
		evt.preventDefault();
		Pair_Event.utils.scrollDown(showExperts)
	})
	
})();

// Carousel
// TODO: need to build code for carousel animation
(function () {
	
	'use strict';
	
	new Glide('#sponsors', {
		type: 'carousel',
		autoplay: 7000,
		animationDuration: 2000,
		perView: 6,
		hoverpause: false,
		keyboard: false
	}).mount()
	
})();

// Notification of event updates
// TODO: Needs completed. must add email mechanism
(function () {
	
	'use strict';
	
	let getNotified = document.getElementById('get_notified');
	let getNotifiedAddress = document.getElementById('get_notified_address');
	
	getNotified.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		let emailValidation = getNotifiedAddress.value;
		
		if (emailValidation === '') {
			console.log('Need to provide an Email')
		} else if (typeof emailValidation === 'string') {
			let isItEmail = Pair_Event.utils.isEmail(emailValidation);
			
			if (!isItEmail) {
				setTimeout(() => {
					document.querySelector('.notifier').innerHTML = "<span class='warning notice'>Please provide a valid email address</span>";
					setTimeout(() => {
						document.querySelector('.notifier').innerHTML = ""
						
					}, 3000)
				}, 1)
			} else {
				setTimeout(() => {
					document.querySelector('.notifier').innerHTML = "<span class='success notice'>Thanks you for registering your interest<br>You will receive an email shortly</span>";
					setTimeout(() => {
						document.querySelector('.notifier').innerHTML = ""
						
					}, 3000)
				}, 1)
			}
		}
	})
	
})();

// initialize the countUp function
(function () {
	
	'use strict';
	
	let counterEl = document.querySelectorAll('.attendance_counter');
	
	for (let x = 0; x < counterEl.length; x++) {
		Pair_Event.utils.countUp(counterEl[x])
	}
	
})();

// Header resize on scroll
(function () {
	
	'use strict';
	let getHeader = document.getElementById('theHeader');
	let getLogo = document.getElementById('logo_img');
	
	window.addEventListener('scroll', () => {
		
		window.requestAnimationFrame(function () {
			
			if (getHeader.scrollTop === window.scrollY) {
				getLogo.src = 'https://via.placeholder.com/150x60?text=Pair+Event+Placeholder';
				
				getHeader.classList.remove('slim_line_nav')
			} else {
				getLogo.src = 'assets/media/testimage.png';
				getHeader.classList.add('slim_line_nav')
			}
			
			
		})
	})
	
	
})();

// Phase 1 of shopping cart
(function () {
	
	'use strict';
	
	// TODO: Think about when the shopping cart is being created and how best to sort multiple shopping baskets
	let ticket_figures = document.querySelectorAll('#ticket_list .for_basket');
	
	for (let x = 0; x < ticket_figures.length; x++) {
		ticket_figures[x].addEventListener('click', (evt) => {
			evt = evt.target;
			let data = evt.dataset;
			
			let newItem = {
				id: data.id,
				title: data.title,
				description: data.description,
				price: data.price,
				quantity: 1
			};
			
			Pair_Event.utils.buildCart(newItem, data.toAdd)
		})
	}
	
})();