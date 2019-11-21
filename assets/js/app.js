// TODO: contact page
// TODO: translator
// TODO: privacy policy
// TODO: why attend
// TODO: tech page
// TODO: speaker flip cards
// TODO: move to ajax json once the sale has been completed
// TODO: include an email mechanism
// TODO: add Links for the social links


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
	ajax: {
		get: () => {
			return Pair_Event.ajax.__ajax('GET').then((jsonObject) => {
				Pair_Event.holders.orderList(jsonObject)
			}, (rejected) => {
				console.log("Couldn't received requested data")
			})
		},
		put: (theJsonData) => {
			Pair_Event.ajax.__ajax('PUT', theJsonData).then((resolvedJsonObject) => {
				console.log("Data was loaded successfully");
			}, (rejected) => {
				console.log('Could not send data to host')
			})
		},
		post: (theJsonData) => {
			Pair_Event.ajax.__ajax('POST', theJsonData).then((resolvedJsonObject) => {
				console.log(resolvedJsonObject)
			}, (reject) => {
				console.log(reject)
			})
			
		},
		__ajax: (Method, sendData = '') => {
			
			return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				
				let statusCode = 200;
				let jsonApiID = '';
				if (Method.toUpperCase() === 'GET' || Method.toUpperCase() === 'PUT') {
					statusCode = 200;
					jsonApiID = '/b26tg?pretty=1';
				} else if (Method.toUpperCase() === 'POST') {
					statusCode = 201;
				}
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4) {
						if (xhr.status === statusCode) {
							resolve(JSON.parse(xhr.response));
						} else {
							reject(false)
						}
					}
				};
				xhr.open(Method, Pair_Event.holders.jsonApiURL + jsonApiID, true);
				if (sendData !== '') {
					xhr.setRequestHeader('Content-Type', "application/json; charset=utf-8");
					
					sendData = JSON.stringify(sendData)
				}
				xhr.send(sendData)
			});
			
		}
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
					delete el.innerText;
					el.innerText = climber;
					
				}, (timerParts))
				
			}
		},
		isEmail: (email) => {
			var newRegEx = new RegExp(/^[a-zA-Z0-9!#$%&'*+\-\/=?^_`{|]{1,64}@[a-zA-Z0-9-]{1,253}\.(?:[a-zA-Z]{2,9}\.[a-zA-Z]{2,20}|[a-zA-Z]{2,20})$/m);
			
			return newRegEx.test(email);
		},
		getOrderById: (orderLists, orderID) => {
			orderLists = orderLists.pair_event_orders;
			if (orderID !== undefined) {
				for (let x = 0; x < orderLists.length; x++) {
					if (orderLists[x].orderId === orderID) {
						return [orderLists[x], x]
					}
				}
				console.log(`Order ${orderID} not found`);
				return [false, -1]
			} else {
				return orderLists.pair_event_orders;
			}
		},
		getItemById: (itemLists, itemID) => {
			if (itemID !== undefined) {
				for (let x = 0; x < itemLists.length; x++) {
					if (itemLists[x].orderId === itemID) {
						return itemLists[x]
					}
				}
				console.log(`Item with ID ${itemID} not found`);
				return false
			} else {
				return itemLists.pair_event_orders;
			}
		},
		getIndexOfItemInList: (id, theList) => {
			for (let x = 0; x < theList.length; x++) {
				if (theList[x].id === id) {
					return x
				}
			}
			return -1
		},
		buildCart: (itemObject) => {
			// TODO: Build this out to deal with adding and removing items from the shopping cart
			
			// serverData
			let serverData = Pair_Event.holders.orderList();
			
			// Build new item
			let newItem = Pair_Event.utils.newItem(itemObject);
			
			// Check if order is present
			let [selectedItems, selectedItemsIndex] = Pair_Event.utils.getOrderById(serverData, itemObject.orderid);
			
			
			// Decide to add or remove items from order
			if (itemObject.toAdd !== undefined) { // Add items to list
				
				// build new order object if one isn't present
				if (!selectedItems) {
					selectedItems = {
						"orderId": itemObject.orderid,
						"orderItems": [],
						"orderTotal": 0,
						"customer": {
							"name": "",
							"address": "",
							"city": "",
							"postcode": "",
							"email": ""
						},
						"orderDate": new Date()
					};
				}
				
				// Either update quantity or add new item to order if not present
				let hasIndex = Pair_Event.utils.getIndexOfItemInList(itemObject.id, selectedItems.orderItems);
				if (hasIndex !== -1) {
					selectedItems.orderItems[hasIndex].quantity += 1;
					selectedItems.orderTotal += selectedItems.orderItems[hasIndex].price;
				} else {
					selectedItems.orderTotal += newItem.price;
					selectedItems.orderItems.push(newItem);
				}
				
				// Decide to add new order or update existing
				if (selectedItemsIndex !== -1) {
					serverData.pair_event_orders[selectedItemsIndex] = selectedItems;
				} else {
					serverData.pair_event_orders.push(selectedItems);
				}
				
			} else { // Remove items from list
				
				if (selectedItemsIndex !== -1) {
					let hasIndex = Pair_Event.utils.getIndexOfItemInList(itemObject.id, selectedItems.orderItems);
					if (hasIndex !== -1) {
						let howMuchQuantity = selectedItems.orderItems[hasIndex].quantity;
						if (howMuchQuantity > 1) {
							selectedItems.orderItems[hasIndex].quantity -= 1;
							selectedItems.orderTotal -= selectedItems.orderItems[hasIndex].price;
						} else {
							selectedItems.orderTotal -= newItem.price;
							selectedItems.orderItems.splice(hasIndex, 1)
						}
					}
					serverData.pair_event_orders[selectedItemsIndex] = selectedItems;
					
				}
			}
			Pair_Event.holders.orderList(serverData);
			
			Pair_Event.utils.outputCartItem(itemObject.orderid, (serverData.pair_event_orders.length - 1));
			Pair_Event.ajax.put(serverData)
		},
		outputCartItem: (orderID, orderIndex) => {
			
			let serverData = Pair_Event.holders.orderList().pair_event_orders[Pair_Event.holders.orderList().pair_event_orders.length - 1];
			let orderCart = serverData.orderItems;
			
			let html = '';
			let pricing = 0;
			
			if (orderIndex > 0) {
				pricing = serverData.orderTotal;
				
				for (let x = 0; x < orderCart.length; x++) {
					
					let subtotal = orderCart[x].quantity * orderCart[x].price;
					let theeOptions = '';
					
					// Build ticket count options
					for (let s = 1; s < 31; s++) {
						if (orderCart[x].quantity === s) {
							theeOptions += `<option selected>${s}</option>`;
						} else {
							theeOptions += `<option>${s}</option>`;
						}
					}
					// TODO: need to add custom images urls for available tickets
					html += `<figure  title="Select from list to increase or decrease ticket count">
                            <figure>
                                <img src="https://via.placeholder.com/80X60" alt="ticket advanced">
                                <div>
                                    <h3 class="title">${orderCart[x].title}</h3>
                                    <select class="cart_ticket_count" data-itemid="${orderCart[x].id}" data-orderid="${orderID}" data-orderIndex="${orderIndex}" title="Select from list to increase or decrease ticket count">
                                       ${theeOptions}
                                    </select>
                                    <i class="fas fa-trash delete_from_cart" data-itemid="${orderCart[x].id}" data-orderid="${orderID}" data-orderIndex="${orderIndex}" title="Click this to delete this ticket from your basket"></i>
                                </div>
                                <figure class="subtotal">
                                    Subtotal: &nbsp;<span class="thisSubtotal">£${subtotal}</span>
                                </figure>
                            </figure>
                        </figure>`;
					
				}
			} else {
				html += ` <section id="ticket_buyer_reminder">Be sure to get your tickets before they're sold out!</section>`
			}
			
			delete document.getElementById('order_list').innerHTML;
			delete document.getElementById('total_value').innerHTML;
			
			document.getElementById('order_list').innerHTML = html;
			document.getElementById('total_value').innerHTML = pricing;
			
			// Build events
			Pair_Event.utils.deleteFromCart();
			Pair_Event.utils.changeQuantityFromCart();
		},
		deleteFromCart: () => {
			let deleteFromCart = document.querySelectorAll('.delete_from_cart');
			
			for (let i = 0; i < deleteFromCart.length; i++) {
				deleteFromCart[i].addEventListener('click', (evt) => {
					evt = evt.target;
					let data = evt.dataset;
					
					let serverData = Pair_Event.holders.orderList();
					let itemIndex = Pair_Event.utils.getIndexOfItemInList(data.itemid, serverData.pair_event_orders[data.orderindex].orderItems);
					
					let thisItem = serverData.pair_event_orders[data.orderindex].orderItems[itemIndex];
					
					let subtractFromTotal = thisItem.quantity * thisItem.price;
					serverData.pair_event_orders[data.orderindex].orderTotal -= subtractFromTotal;
					
					serverData.pair_event_orders[data.orderindex].orderItems.splice(itemIndex, 1);
					
					
					Pair_Event.holders.orderList(serverData);
					Pair_Event.utils.outputCartItem(data.orderid, data.orderindex);
					Pair_Event.ajax.put(serverData);
				})
			}
		},
		changeQuantityFromCart: () => {
			let selectOptions = document.querySelectorAll('.cart_ticket_count');
			let serverData = Pair_Event.holders.orderList();
			for (let i = 0; i < selectOptions.length; i++) {
				selectOptions[i].addEventListener('change', (evt) => {
					evt.preventDefault();
					evt = evt.target;
					let data = evt.dataset;
					let countChange = parseInt(evt.value);
					let itemIndex = Pair_Event.utils.getIndexOfItemInList(data.itemid, serverData.pair_event_orders[data.orderindex].orderItems);
					let thisItem = serverData.pair_event_orders[data.orderindex].orderItems[itemIndex];
					
					
					let valueToChange = 0;
					let difference = 0;
					
					if (countChange > thisItem.quantity) {
						difference = countChange - thisItem.quantity;
						valueToChange = difference * thisItem.price;
						serverData.pair_event_orders[data.orderindex].orderTotal += valueToChange;
					} else {
						difference = thisItem.quantity - countChange;
						valueToChange = difference * thisItem.price;
						serverData.pair_event_orders[data.orderindex].orderTotal -= valueToChange;
					}
					
					serverData.pair_event_orders[data.orderindex].orderItems[itemIndex].quantity = countChange;
					
					Pair_Event.holders.orderList(serverData);
					Pair_Event.utils.outputCartItem(data.orderid, data.orderindex);
					Pair_Event.ajax.put(serverData);
				})
			}
		},
		newItem: (item) => {
			let thisItem = Pair_Event.holders.priceList();
			
			if (item.id in thisItem) {
				thisItem = thisItem[[item.id]]
			} else {
				console.log("Ticket not available");
				return false;
			}
			
			return {
				"id": item.id,
				"title": thisItem.title,
				"description": thisItem.description,
				"price": thisItem.price,
				"quantity": 1,
				"subtotal": thisItem.price
			}
				;
		},
		formValidation: () => {
		
		},
		getOrderByIndex: (orderID, itemID = null) => {
			
			let theCarts = Pair_Event.holders.orderList();
			if (itemID) {
				return theCarts.pair_event_orders[orderID].orderItems[itemID]
			}
			
			return theCarts.pair_event_orders[orderID]
		},
		notifier: (toNotify) => {
			
			`
			Notifier Package Template
			+++++++++++++++++++++++++
			
			{
				target: 'email',
				message: "Email field can't left empty",
				isSuccess: false
			}`;
			
			if (!Array.isArray(toNotify)) {
				toNotify = [toNotify]
			}
			
			let notifiers = document.querySelectorAll('.notifier');
			
			let html = "<ul>";
			for (let j = 0; j < toNotify.length; j++) {
				if (toNotify[j].isSuccess) {
					html += "<li><span class='success notice'>" + toNotify[j].message + "</span></li>"
				} else {
					html += "<li><span class='warning notice'>" + toNotify[j].message + "</span></li>"
				}
			}
			html += "</ul>";
			
			for (let i = 0; i < notifiers.length; i++) {
				setTimeout(() => {
					notifiers[i].innerHTML = html;
					setTimeout(() => {
						notifiers[i].innerHTML = null;
					}, 3000)
				}, 1)
			}
		},
	},
	holders: {
		priceList: () => {
			// Simulate backend server price verification checks
			prices = {
				"1": {
					"title": "Platinum Package",
					"description": "Access all areas. whether that's backstage, at the coding booth or simply in the audience. you can talk to any member of the any team or Get your hands dirty in the tech pit what ever you want you got it. meals and drinks will be provided",
					"price": 350
				},
				"2": {
					"title": "Enthusiast Package",
					"description": "Access to the team and coding booth, also meet the speakers",
					"price": 250
				},
				"3": {
					"title": "Developer Package",
					"description": "Meet the speakers, access to coding booth and opportunities to collaborate",
					"price": 200
				},
				"4": {
					"title": "Student Package",
					"description": "Access all areas",
					"price": 0
				}
			};
			
			
			return prices
		},
		jsonApi: () => {
			return {
				"pair_event_orders": [],
				"priceCheck": {
					"1": {
						"title": "Platinum Package",
						"description": "Access all areas. whether that's backstage, at the coding booth or simply in the audience. you can talk to any member of the any team or Get your hands dirty in the tech pit what ever you want you got it. meals and drinks will be provided",
						"price": 350
					},
					"2": {
						"title": "Enthusiast Package",
						"description": "Access to the team and coding booth, also meet the speakers",
						"price": 250
					},
					"3": {
						"title": "Developer Package",
						"description": "Meet the speakers, access to coding booth and opportunities to collaborate",
						"price": 200
					},
					"4": {
						"title": "Student Package",
						"description": "Access all areas",
						"price": 0
					}
				},
				"shopOpened": "2019-11-07 00:00:00",
				
				
			}
		},
		jsonApiURL: 'https://api.myjson.com/bins',
		orderList: (orderJson = '') => {
			
			this.orders = (orderJson !== '') ? orderJson : this.orders;
			
			return this.orders
		}
		
	}
	
	
};

// Load data from json server on every page load
(function () {
	
	'use strict';
	
	document.onload = () => {
		Pair_Event.ajax.get()
	}
	
})();

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
			Pair_Event.storage.store('initial_popup', true);
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
		
		
		let countdownClocks = document.querySelectorAll('.countdown');
		
		for (let x = 0; x < countdownClocks.length; x++) {
			
			// countdownClocks[x].children[0].children[0].innerText = null;
			// countdownClocks[x].children[0].children[1].innerText = null;
			// countdownClocks[x].children[0].children[2].innerText = null;
			// countdownClocks[x].children[0].children[3].innerText = null;
			
			countdownClocks[x].children[0].children[0].innerText = days + "\nDays";
			countdownClocks[x].children[0].children[1].innerText = hours + "\nHours";
			countdownClocks[x].children[0].children[2].innerText = minutes + "\nMins";
			countdownClocks[x].children[0].children[3].innerText = seconds + "\nSecs";
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
// TODO: add unique orderid for each order
(function () {
	
	'use strict';
	
	let open_Cart = document.querySelectorAll('.basket_opener');
	
	for (let i = 0; i < open_Cart.length; i++) {
		
		
		open_Cart[i].addEventListener('click', (evt) => {
			//Pair_Event.ajax.put(Pair_Event.holders.jsonApi());
			evt = evt.target;
			
			// TODO: this is temporary. once cart is built move all get
			//  request to local property and update json server on order completion
			Pair_Event.ajax.__ajax('GET').then((resolved) => {
				
				//let resolved = Pair_Event.holders.orderList();
				Pair_Event.holders.orderList(resolved);
				let addOrderID = document.querySelectorAll('.add_order_number');
				if (resolved.pair_event_orders.length > 0) {
					let targetItem = resolved.pair_event_orders[(resolved.pair_event_orders.length - 1)].orderId;
					
					for (let s = 0; s < addOrderID.length; s++) {
						addOrderID[s].dataset.orderid = (parseInt(targetItem) + 1);
						addOrderID[s].dataset.orderIndex = resolved.pair_event_orders.length.toString();
					}
				} else {
					for (let s = 0; s < addOrderID.length; s++) {
						addOrderID[s].dataset.orderid = 1;
						addOrderID[s].dataset.orderIndex = 0;
					}
				}
				
			}, (rejected) => {
				console.log('Data couldn\'t be sent!')
			});
			
			
			document.getElementById(evt.dataset.modalType).style.display = 'grid';
			
			Pair_Event.holders.cart_n_glide = new Glide('#shop_baskets', {
				type: 'slider',
				autoplay: false,
				animationDuration: 2000,
				perView: 1,
				// startAt: 2,
				hoverpause: false,
				keyboard: false
			}).mount();
			
			Pair_Event.holders.cart_n_glide.disable();
			
		});
	}
})();

// Close basket
// TODO: add more action for when the shopping cart close without completion
(function () {
	
	'use strict';
	
	let close_cart = document.querySelectorAll('.basket_close');
	let basket_modal = document.getElementById('shop_baskets');
	for (let x = 0; x < close_cart.length; x++) {
		close_cart[x].addEventListener('click', (evt) => {
			evt = evt.target;
			let data = evt.dataset;
			
			if (data.phase === "3") {
				document.location.reload()
			} else {
				basket_modal.style.display = 'none'
			}
			
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
(function () {
	
	'use strict';
	
	new Glide('#sponsors', {
		type: 'carousel',
		autoplay: 1000,
		animationDuration: 2000,
		perView: 6,
		//hoverpause: false,
		//keyboard: false
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
			
			Pair_Event.utils.notifier({
				target: 'email',
				message: "Email field can't left empty",
				isSuccess: false
			})
		} else if (typeof emailValidation === 'string') {
			let isItEmail = Pair_Event.utils.isEmail(emailValidation);
			
			
			if (isItEmail) {
				Pair_Event.utils.notifier({
					target: 'email',
					message: 'Thanks you for registering your interest<br>You will receive an email shortly',
					isSuccess: true
				})
			} else {
				Pair_Event.utils.notifier({
					target: 'email',
					message: 'Please provide a valid email address',
					isSuccess: false
				})
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
	
	window.addEventListener('scroll', () => {
		
		window.requestAnimationFrame(function () {
			
			if (getHeader.scrollTop === window.scrollY) {
				
				getHeader.classList.remove('slim_line_nav')
			} else {
				getHeader.classList.add('slim_line_nav')
			}
			
			
		})
	})
	
	
})();

// Phase 1 of shopping cart
(function () {
	
	'use strict';
	
	let ticket_figures = document.querySelectorAll('#ticket_list .for_basket');
	
	for (let x = 0; x < ticket_figures.length; x++) {
		ticket_figures[x].addEventListener('click', (evt) => {
			evt = evt.target;
			let data = evt.dataset;
			
			Pair_Event.utils.buildCart(data)
		})
	}
})();

// Move to Phase 2
(function () {
	
	'use strict';
	
	let movePhase = document.querySelectorAll('.moveCartPhase');
	
	let moveForward = () => {
		Pair_Event.holders.cart_n_glide.enable();
		Pair_Event.holders.cart_n_glide.go('>');
		setTimeout(() => Pair_Event.holders.cart_n_glide.disable(), 2000)
	};
	
	
	for (let i = 0; i < movePhase.length; i++) {
		movePhase[i].addEventListener('click', (evt) => {
			evt.preventDefault();
			evt = evt.target;
			let data = evt.dataset;
			
			let thisCart = Pair_Event.utils.getOrderByIndex(data.orderIndex);
			let notifier = document.querySelector('.notifier');
			let notifierObject = [];
			notifier.innerHTML = null;
			
			switch (data.phase) {
				case '1':
					console.log('phase 1');
					
					if (thisCart !== undefined && thisCart.orderItems.length > 0) {
						moveForward()
					} else {
						notifierObject.push({
							target: "cartphase1",
							message: "You need to add at least one ticket to cart",
							isSuccess: false
						});
					}
					
					break;
				case '2':
					let WhichIsChecked = document.querySelectorAll('.radio_payment_method');
					let isChecked = '';
					
					for (let j = 0; j < WhichIsChecked.length; j++) {
						if (WhichIsChecked[j].checked) {
							isChecked = WhichIsChecked[j].dataset.paymentOption
						}
					}
					
					if (isChecked === 'payment_option_stripe') {
						
						let regEx = new RegExp(/^[0-9]+$/);
						let cardNum = document.getElementById('stripe_card_number');
						
						if (cardNum.value.length !== 16 && !regEx.test(cardNum.value)) {
							notifierObject.push({
								target: "cartCardNum",
								message: "Provide a valid card number",
								isSuccess: false
							})
						}
						
						let expiryDate = document.getElementById('stripe_card_expiry');
						let regExExpiry = new RegExp(/^[0-9]{2}\/[0-9]{2}$/);
						
						if (!regExExpiry.test(expiryDate.value)) {
							notifierObject.push({
								target: "cartExpiryDate",
								message: "Provide a valid expiry date",
								isSuccess: false
							});
						} else {
							
							let month = expiryDate.value.slice(0, 2);
							let year = expiryDate.value.slice(3, 5);
							let thisYear = new Date().getFullYear().toString().substr(-2);
							thisYear = Number(thisYear);
							
							if (month < 1 || month > 12) {
								notifierObject.push({
									target: "cartExpiryDateMonth",
									message: "Expiry month is out of range",
									isSuccess: false
								});
							}
							
							if (year < thisYear || year > (thisYear + 5)) {
								notifierObject.push({
									target: "cartExpiryDateExceeded",
									message: "Expiry year is out of range",
									isSuccess: false
								});
							}
						}
						
						let securityCode = document.getElementById('stripe_card_secure_code');
						let regExSecureCode = new RegExp(/^[0-9]{3}$/);
						
						if (!regExSecureCode.test(securityCode.value)) {
							notifierObject.push({
								target: "cartSecureCode",
								message: "Provide a valid security code",
								isSuccess: false
							});
						}
						
					} else if (isChecked === 'payment_option_paypal') {
						
						let paypalUsername = document.getElementById('paypal_login_id');
						let paypalPassword = document.getElementById('paypal_login_password');
						
						if (paypalUsername.value.length < 6) {
							notifierObject.push({
								target: "cartPaypalUsername",
								message: "Username not recognised",
								isSuccess: false
							});
						}
						if (paypalPassword.value.length < 6) {
							notifierObject.push({
								target: "cartPaypalPassword",
								message: "Password or Username was entered incorrectly",
								isSuccess: false
							});
						}
					}
					
					let paymentName = document.getElementById('payment_name').value;
					let paymentEmail = document.getElementById('payment_email').value;
					let paymentStreet = document.getElementById('payment_street').value;
					let paymentCity = document.getElementById('payment_city').value;
					let paymentPostcode = document.getElementById('payment_postcode').value;
					
					if (paymentName === '') {
						notifierObject.push({
							target: "cartPersonFirstName",
							message: "Please supply your first name",
							isSuccess: false
						});
					}
					
					if (paymentEmail === '') {
						notifierObject.push({
							target: "cartPersonEmail",
							message: "Please supply your email",
							isSuccess: false
						});
					} else {
						if (!Pair_Event.utils.isEmail(paymentEmail)) {
							notifierObject.push({
								target: "cartPersonEmailValid",
								message: "Invalid email provided",
								isSuccess: false
							});
						}
					}
					
					if (paymentStreet === '') {
						notifierObject.push({
							target: "cartPersonStreet",
							message: "Please supply your street",
							isSuccess: false
						});
					}
					
					if (paymentCity === '') {
						notifierObject.push({
							target: "cartPersonCity",
							message: "Please supply your city",
							isSuccess: false
						});
					}
					
					if (paymentPostcode === '') {
						notifierObject.push({
							target: "cartPersonPostcode",
							message: "Please supply your postcode",
							isSuccess: false
						});
					}
					
					
					if (notifierObject.length === 0) {
						thisCart.customer.name = paymentName;
						thisCart.customer.address = paymentStreet;
						thisCart.customer.city = paymentCity;
						thisCart.customer.postcode = paymentPostcode;
						thisCart.customer.email = paymentEmail;
						
						let displayPurchase = document.getElementById('the_success_order');
						let html = ``;
						for (let i = 0; i < thisCart.orderItems.length; i++) {
							console.log(thisCart.orderItems[i]);
							html += `<section><figure>${thisCart.orderItems[i].title}: &nbsp;&nbsp;</figure><figure>#${thisCart.orderItems[i].quantity}</figure></section>`
						}
						
						displayPurchase.innerHTML = html;
						
						moveForward()
					}
					
					break;
				case "3":
					console.log('phase 3');
					document.location.reload();
					break;
				default:
					console.log('Phase default');
					break;
			}
			
			// Send notifications
			Pair_Event.utils.notifier(notifierObject)
		})
	}
	
})();

// Show appropriate payment method on selection
(function () {
	
	'use strict';
	
	let paymentOptions = document.querySelectorAll('.radio_payment_method');
	
	for (let i = 0; i < paymentOptions.length; i++) {
		paymentOptions[i].addEventListener('click', (evt) => {
			evt = evt.target;
			let data = evt.dataset;
			
			let methodBoxes = document.querySelectorAll('.payment_option_method');
			let checkBoxes = document.querySelectorAll('.radio_payment_method');
			
			for (let j = 0; j < methodBoxes.length; j++) {
				methodBoxes[j].style.display = 'none';
			}
			for (let i = 0; i < checkBoxes.length; i++) {
				checkBoxes[i].checked = false;
			}
			
			evt.checked = true;
			document.getElementById(data.paymentOption).style.display = 'grid';
		})
	}
	
})();

// Contact Message Validation
(function () {
	
	'use strict';
	
	let contactMessageValidator = document.getElementById('contact_message_submitter');
	
	
	contactMessageValidator.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		let contactFirstName = document.getElementById('contact_first_name').value;
		let contactSurname = document.getElementById('contact_surname').value;
		let contactEmail = document.getElementById('contact_email').value;
		let contactTextarea = document.getElementById('contact_textarea').value;
		let notifierObject = [];
		
		if (contactFirstName === '') {
			notifierObject.push({
				target: 'contact_form',
				message: "Please supply a first name",
				isSuccess: false
			})
		}
		
		if (contactSurname === '') {
			notifierObject.push({
				target: 'contact_form',
				message: "Please supply your Surname",
				isSuccess: false
			})
		}
		
		if (contactEmail === '') {
			notifierObject.push({
				target: 'contact_form',
				message: 'Please supply your email',
				isSuccess: false
			})
		}else{
			if(!Pair_Event.utils.isEmail(contactEmail)){
				notifierObject.push({
					target: 'contact_form',
					message: "Provide a valid email",
					isSuccess: false
				})
			}
		}
		
		if (contactTextarea === '') {
			notifierObject.push({
				target: 'contact_form',
				message: "Need to add a message",
				isSuccess: false
			})
		}
		
		if(notifierObject.length > 0){
			Pair_Event.utils.notifier(notifierObject)
		}else{
			Pair_Event.utils.notifier({
				target: 'contact_form',
				message: "Message sent successfully",
				isSuccess: true
			});
			
			setTimeout(() => document.location.reload(), 3000)
		}
	})
	
})();
