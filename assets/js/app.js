// TODO: translator
// TODO: privacy policy
// TODO: tech page
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
					html += `<figure  title="Select from list to increase or decrease ticket count">
                            <figure>
                                <img src="${Pair_Event.holders.ticketImage[orderCart[x].id]}" alt="ticket advanced">
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
		headerShrink: () => {
			let getHeader = document.getElementById('theBigHeader');
			let translator = {};
			
			window.addEventListener('scroll', () => {
				
				window.requestAnimationFrame(function () {
					translator = document.querySelector('#translator_menu ul');
					
					if (getHeader.scrollTop === window.scrollY) {
						
						getHeader.classList.remove('slim_line_nav');
						translator.style.margin = "15px 0";
						
					} else {
						getHeader.classList.add('slim_line_nav');
						translator.style.margin = "0px";
					}
					
					
				})
			})
			
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
						notifiers[i].innerHTML = '';
					}, 3000)
				}, 1)
			}
		},
		translated: (language, translations) => {
			let toTranslate = document.querySelectorAll('.translation');
			
			for (let i = 0; i < toTranslate.length; i++) {
				let thisEl = toTranslate[i];
				let theData = thisEl.dataset;
				
				let theTranslation = translations[theData.translationId][language];
				
				thisEl.innerHTML = null;
				thisEl.innerHTML = theTranslation;
			}
		},
		hasStudent: (theCart) => {
			let itemList = theCart.orderItems;
			for (let i = 0; i < itemList.length; i++) {
				if (itemList[i].id === "4") {
					return true;
				}
			}
			return false;
		},
		addToFontClass: () => {
			let fontUpdater = document.querySelectorAll('.zoom_updater');
			let ieFixer = document.querySelectorAll('.card__face--back');

			for (let i = 0; i < ieFixer.length; i++) {
				if(!ieFixer[i].classList.contains('zoomIEFixer')){
					ieFixer[i].classList.add('zoomIEFixer')
				}
			}
			
			for (let i = 0; i < fontUpdater.length; i++) {
				if (fontUpdater[i].classList.contains('zoomFont1')){
					fontUpdater[i].classList.remove('zoomFont1');
					fontUpdater[i].classList.add('zoomFont2')
				}else if (fontUpdater[i].classList.contains('zoomFont2')){
					fontUpdater[i].classList.remove('zoomFont2');
					fontUpdater[i].classList.add('zoomFont3')
				}else if (fontUpdater[i].classList.contains('zoomFont3')){
					fontUpdater[i].classList.remove('zoomFont3');
					fontUpdater[i].classList.add('zoomFont1')
				}else{
					fontUpdater[i].classList.add('zoomFont1')
				}
			}
		},
		addToBackGroundColor: () => {
			let overlayUpdater = document.querySelectorAll('.overlay_updater');
			for (let i = 0; i < overlayUpdater.length; i++) {
				overlayUpdater[i].classList.toggle('overlayUpdated')
			}
		}
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
		},
		translations: {
			1: {
				en: "Pair Event Proudly Presents:",
				es: "El evento Pair presenta con orgullo:",
				fr: "L'événement en couple présente fièrement:",
				it: "Accoppia gli eventi con orgoglio:",
				de: "Paar evenement presenteert met trots:"
			},
			2: {
				en: "&emsp;&emsp;&emsp;5G The Future Event",
				es: "&emsp;&emsp;&emsp;5G El evento futuro",
				fr: "&emsp;&emsp;&emsp;5G L'événement futur",
				it: "&emsp;&emsp;&emsp;5G The Future Event",
				de: "&emsp;&emsp;&emsp;5G Das zukünftige Ereignis"
			},
			3: {
				en: "Free Admission For Students",
				es: "Entrada gratuita para estudiantes",
				fr: "Entrée gratuite pour les étudiants",
				it: "Ingresso gratuito per gli studenti",
				de: "Freier Eintritt für Studierende"
			},
			4: {
				en: "Free Give Aways Throughout The Event",
				es: "Regalos gratis durante todo el evento",
				fr: "Dons gratuits tout au long de l'événement",
				it: "Dare sempre durante l'evento",
				de: "Give Aways während der Veranstaltung"
			},
			5: {
				en: "Chance To Win Apple Products",
				es: "Oportunidad de ganar productos de Apple",
				fr: "Chance de gagner des produits Apple",
				it: "Possibilità di vincere prodotti Apple",
				de: "Chance, Apple-Produkte zu gewinnen"
			},
			6: {
				en: "And Much Much More",
				es: "Y mucho, mucho más",
				fr: "Et bien plus encore",
				it: "E molto altro ancora",
				de: "Und sehr viel mehr"
			},
			7: {
				en: "Contact Us",
				es: "Contáctenos",
				fr: "Contactez nous",
				it: "Contattaci",
				de: "Kontaktiere uns"
			},
			8: {
				en: "Telephone:",
				es: "Teléfono:",
				fr: "Téléphone:",
				it: "Telefono:",
				de: "Telefon:"
			},
			9: {
				en: "First Name:",
				es: "Nombre de pila:",
				fr: "Prénom:",
				it: "Nome di battesimo:",
				de: "Vorname:"
			},
			10: {
				en: "Surname:",
				es: "Apellido:",
				fr: "Nom de famille:",
				it: "Cognome:",
				de: "Nachname:"
			},
			11: {
				en: "Your Query",
				es: "Su consulta",
				fr: "Votre requête",
				it: "La tua domanda",
				de: "Ihre Anfrage"
			},
			12: {
				en: "Tell Me",
				es: "Dime",
				fr: "Dîtes-moi",
				it: "Dimmi",
				de: "Sag mir"
			},
			13: {
				en: "Email Us Directly",
				es: "Envíenos un correo electrónico directamente",
				fr: "Envoyez-nous un courriel directement",
				it: "Inviaci un'e-mail direttamente",
				de: "Mailen Sie uns direkt"
			},
			14: {
				en: "Pair Event Proudly Presents:<br> &emsp; &emsp;<small>5G The Future Connection</small>",
				es: "El evento Pair presenta con orgullo:<br> &emsp; &emsp;<small>5G El evento futuro</small>",
				fr: "L'événement en couple présente fièrement:<br> &emsp; &emsp;<small>5G L'événement futur</small>",
				it: "Accoppia gli eventi con orgoglio:<br> &emsp; &emsp;<small>5G The Future Connection</small>",
				de: "Paar evenement presenteert met trots:<br> &emsp; &emsp;<small>5G Das zukünftige Ereignis</small>"
			},
			15: {
				en: "<i class='far fa-square'></i>&nbsp;LEARN THE<br>TECH",
				es: "<i class='far fa-square'></i>&nbsp;APRENDE EL<br>TECH",
				fr: "<i class='far fa-square'></i>&nbsp;APPRENEZ LA<br>TECHNOLOGIE",
				it: "<i class='far fa-square'></i>&nbsp;IMPARA IL<br>TECH",
				de: "<i class='far fa-square'></i>&nbsp;LERNE DAS<br>TECHNIK"
			},
			16: {
				en: "<i class='far fa-square'></i>&nbsp;MEET THE  <br>EXPERTS",
				es: "<i class='far fa-square'></i>&nbsp;SATISFACER LA  <br>Expertos",
				fr: "<i class='far fa-square'></i>&nbsp;RENCONTRER LE  <br>EXPERTS",
				it: "<i class='far fa-square'></i>&nbsp;INCONTRA IL  <br>ESPERTI",
				de: "<i class='far fa-square'></i>&nbsp;TREFFE DEN  <br>EXPERTEN"
			},
			17: {
				en: "Stay In The Loop",
				es: "Permanecer en el bucle",
				fr: "Rester dans la boucle",
				it: "Stay In The Loop",
				de: "Bleiben Sie auf dem Laufenden"
			},
			18: {
				en: "We can notify you of any updates or changes to the itinerary",
				es: "Podemos notificarle sobre cualquier actualización o cambio en el itinerario.",
				fr: "Nous pouvons vous informer de toute mise à jour ou modification de l'itinéraire",
				it: "Siamo in grado di avvisare di eventuali aggiornamenti o modifiche all'itinerario",
				de: "Wir können Sie über Aktualisierungen oder Änderungen der Reiseroute informieren"
			},
			19: {
				en: "Why Attend?",
				es: "¿Por qué asistir?",
				fr: "Pourquoi assister?",
				it: "Perché partecipare?",
				de: "Warum teilnehmen?"
			},
			20: {
				en: "Join List",
				es: "Unirse a la lista",
				fr: "Rejoindre la liste",
				it: "Iscriviti alla lista",
				de: "Beitrittsliste"
			},
			21: {
				en: "How To Attend",
				es: "Cómo asistir",
				fr: "Comment participer",
				it: "Come partecipare",
				de: "Wie nehme ich teil?"
			},
			22: {
				en: "Speakers",
				es: "el altavoz",
				fr: "Haut-parleurs",
				it: "Altoparlanti",
				de: "der Sprecher"
			},
			23: {
				en: "Industry leaders share their ideas on the future of this emerging technology and show us how higher bandwidth will open up our devices to do so much more",
				es: "Los líderes de la industria comparten sus ideas sobre el futuro de esta tecnología emergente y nos muestran cómo un mayor ancho de banda abrirá nuestros dispositivos para hacer mucho más",
				fr: "Les chefs de file du secteur partagent leurs idées sur l'avenir de cette technologie émergente et nous montrent comment une bande passante plus large ouvrira nos appareils à faire tellement plus",
				it: "I leader del settore condividono le loro idee sul futuro di questa tecnologia emergente e ci mostrano come una maggiore larghezza di banda aprirà i nostri dispositivi per fare molto di più",
				de: "Branchenführer teilen ihre Vorstellungen über die Zukunft dieser aufstrebenden Technologie mit und zeigen uns, wie eine höhere Bandbreite unsere Geräte für weitaus mehr Möglichkeiten öffnet"
			},
			24: {
				en: "Research Leader 5G Industry Collaborations, Ericsson",
				es: "Líder de investigación 5G Industry Collaborations, Ericsson",
				fr: "Chef de recherche des collaborations de l'industrie 5G, Ericsson",
				it: "Responsabile della ricerca 5G Industry Collaborations, Ericsson",
				de: "Forschungsleiter 5G Industry Collaborations, Ericsson"
			},
			25: {
				en: "Rowan Högman is Research Leader and Head of 5G Industry Collaborations at Ericsson. In this capacity he is responsible for coordinating and accumulating insights from Ericsson’s more than 50 5G research industry collaborations. Mr Högman was between 2016 and 2018 Head of Ericsson’s Marketing & Communications Operations. Previous to this, Rowan Högman was Head of Strategic Marketing 2015-2016 and has held various leading roles in the communications industry the past 20 years. ",
				es: "Rowan Högman es Líder de Investigación y Jefe de Colaboraciones de la Industria 5G en Ericsson. En esta capacidad, es responsable de coordinar y acumular conocimientos de las más de 50 colaboraciones de la industria de investigación 5G de Ericsson. Högman estuvo entre 2016 y 2018 Jefe de Operaciones de Marketing y Comunicaciones de Ericsson. Antes de esto, Rowan Högman fue Jefe de Marketing Estratégico 2015-2016 y ha desempeñado varios roles principales en la industria de las comunicaciones en los últimos 20 años.",
				fr: "Rowan Högman est responsable de la recherche et responsable des collaborations industrielles 5G chez Ericsson. À ce titre, il est responsable de la coordination et de la collecte des informations tirées de plus de 50 collaborations du secteur de la recherche 5G d’Ericsson. M. Högman était entre 2016 et 2018 responsable des opérations marketing et communications d’Ericsson. Auparavant, Rowan Högman était responsable du marketing stratégique 2015-2016 et a occupé divers rôles de premier plan dans l'industrie des communications au cours des 20 dernières années.",
				it: "Rowan Högman è Research Leader e Head of 5G Industry Collaborations presso Ericsson. In tale veste è responsabile del coordinamento e dell'accumulo di approfondimenti dalle oltre 50 collaborazioni del settore della ricerca 5G di Ericsson. Högman è stato tra il 2016 e il 2018 a capo delle operazioni di marketing e comunicazione di Ericsson. In precedenza, Rowan Högman era a capo del marketing strategico 2015-2016 e ha ricoperto vari ruoli di spicco nel settore delle comunicazioni negli ultimi 20 anni.",
				de: "Rowan Högman ist Forschungsleiter und Leiter von 5G Industry Collaborations bei Ericsson. In dieser Funktion ist er verantwortlich für die Koordination und Sammlung von Erkenntnissen aus über 50 5G-Forschungskollaborationen von Ericsson. Herr Högman war von 2016 bis 2018 Leiter der Abteilung Marketing und Kommunikation von Ericsson. Zuvor war Rowan Högman Leiter Strategisches Marketing 2015-2016 und hatte in den letzten 20 Jahren verschiedene Führungspositionen in der Kommunikationsbranche inne."
			},
			26: {
				en: "Professor of Digital Transformation Design",
				es: "Profesor de Diseño de Transformación Digital",
				fr: "Professeur de design de transformation numérique",
				it: "Professore di Digital Transformation Design",
				de: "Professor für Digital Transformation Design"
			},
			27: {
				en: "Karen is currently Professor of Digital Transformation Design at the University of Brighton; University Lead for the research theme ‘Connected Futures’ and Academic Lead of the Digital Catapult Centre Brighton (DCCB). She is a Women in Games Ambassador and with a background in experimental electronic arts, she has 24 years' experience designing human-centred experiences of next generation digital. Her first website was in 1994, Clients have included PlayStation, Diesel, ITV, Which?, Top Shop and EY.",
				es: "Karen es actualmente profesora de diseño de transformación digital en la Universidad de Brighton; Líder universitario para el tema de investigación \"Futuros conectados\" y Líder académico del Centro digital de catapulta Brighton (DCCB). Es embajadora de Women in Games y tiene experiencia en artes electrónicas experimentales, tiene 24 años de experiencia en el diseño de experiencias centradas en el ser humano de la próxima generación digital. Su primer sitio web fue en 1994, los clientes incluyeron PlayStation, Diesel, ITV, Which ?, Top Shop y EY.",
				fr: "Karen est actuellement professeur de design de transformation numérique à l'Université de Brighton; Université responsable du thème de recherche «Connected Futures» et responsable académique du Digital Catapult Centre Brighton (DCCB). Elle est ambassadrice de Women in Games et possède une formation en arts électroniques expérimentaux. Elle possède 24 ans d'expérience dans la conception d'expériences centrées sur l'homme du numérique de la prochaine génération. Son premier site web était en 1994. Ses clients comprenaient PlayStation, Diesel, ITV, Which ?, Top Shop et EY.",
				it: "Karen è attualmente professore di Digital Transformation Design all'Università di Brighton; Responsabile universitario per il tema di ricerca \"Connected Futures\" e Responsabile accademico del Digital Catapult Center di Brighton (DCCB). Ambasciatrice di Women in Games e con esperienza in arti elettroniche sperimentali, ha 24 anni di esperienza nella progettazione di esperienze incentrate sull'uomo del digitale di prossima generazione. Il suo primo sito web è stato nel 1994, i clienti hanno incluso PlayStation, Diesel, ITV, Which ?, Top Shop ed EY.",
				de: "Karen ist derzeit Professorin für Digital Transformation Design an der University of Brighton. Universitätsleiter für das Forschungsthema „Connected Futures“ und akademischer Leiter des Digital Catapult Center Brighton (DCCB). Sie ist eine Botschafterin für Women in Games und verfügt über 24 Jahre Erfahrung in der Gestaltung menschenzentrierter Erfahrungen der nächsten digitalen Generation. Ihre erste Website war 1994. Zu ihren Kunden gehörten PlayStation, Diesel, ITV, Which ?, Top Shop und EY."
			},
			28: {
				en: "AN",
				es: "UN",
				fr: "UN",
				it: "un",
				de: "EIN"
			},
			29: {
				en: "Head of Business Development, Three",
				es: "Jefe de Desarrollo de Negocios, Tres",
				fr: "Chef du développement des affaires, Trois",
				it: "Responsabile dello sviluppo aziendale, tre",
				de: "Leiter Geschäftsentwicklung, drei"
			},
			30: {
				en: "Darren is Head of Business Development and IOT at Three UK. He owns IOT, MVNO and wholesale commercial partnerships, and has been instrumental in driving Three’s IOT growth strategy which includes 5G and NBIOT. Prior to joining Three, Darren was General Manager of Products for BT, where he led their re-entry into the consumer mobile space. In addition to day-to-day operation of the business, Darren was responsible for BT Mobile’s ‘Digital and Mobile First’ strategy, driving BT’s highest online engagement through sales, service, and app.",
				es: "Darren es Jefe de Desarrollo de Negocios e IOT en Three UK. Es propietario de IOT, MVNO y asociaciones comerciales mayoristas, y ha sido fundamental para impulsar la estrategia de crecimiento IOT de Three, que incluye 5G y NBIOT. Antes de unirse a Three, Darren fue Gerente General de Productos para BT, donde dirigió su reingreso al espacio móvil de consumo. Además de la operación diaria del negocio, Darren fue responsable de la estrategia \"Digital y móvil primero\" de BT Mobile, impulsando el mayor compromiso en línea de BT a través de ventas, servicio y aplicación.",
				fr: "Darren est responsable du développement commercial et de l'IOT chez Three UK. Il est propriétaire des partenariats IOT, MVNO et des partenariats commerciaux de gros, et a joué un rôle déterminant dans la stratégie de croissance de Three, qui inclut la 5G et la NBIOT. Avant de rejoindre Three, Darren était directeur général des produits chez BT, où il dirigeait leur retour dans l’espace mobile grand public. Outre le fonctionnement quotidien de l’entreprise, Darren était responsable de la stratégie «Numérique et mobile d’abord» de BT Mobile.",
				it: "Darren è Head of Business Development e IOT presso Three UK. Possiede IOT, MVNO e partnership commerciali all'ingrosso ed è stato determinante nel guidare la strategia di crescita IOT di Three che include 5G e NBIOT. Prima di entrare in Three, Darren è stato General Manager dei prodotti per BT, dove ha guidato il loro rientro nello spazio mobile di consumo. Oltre alla gestione quotidiana dell'attività, Darren era responsabile della strategia \"Digital and Mobile First\" di BT Mobile, guidando il più alto coinvolgimento online di BT attraverso vendite, servizi e app.",
				de: "Darren ist Head of Business Development und IOT bei Three UK. Er besitzt IOT-, MVNO- und Großhandels-Partnerschaften und war maßgeblich an der Entwicklung der IOT-Wachstumsstrategie von Three beteiligt, zu der auch 5G und NBIOT gehören. Vor seinem Wechsel zu Three war Darren General Manager für Produkte bei BT, wo er den Wiedereinstieg in den mobilen Bereich für Endverbraucher leitete. Neben dem täglichen Geschäftsbetrieb war Darren für die Strategie „Digital and Mobile First“ von BT Mobile verantwortlich, die BTs größtes Online-Engagement durch Vertrieb, Service und App vorantreibt."
			},
			31: {
				en: "<i class='fas fa-people-carry'></i> Share Us!",
				es: "<i class='fas fa-people-carry'></i> Compartir",
				fr: "<i class='fas fa-people-carry'></i> Partager",
				it: "<i class='fas fa-people-carry'></i> Condividere",
				de: "<i class='fas fa-people-carry'></i> Teilen"
			},
			32: {
				en: "About Us",
				es: "Sobre nosotros",
				fr: "À propos de nous",
				it: "Riguardo a noi",
				de: "Über uns"
			},
			33: {
				en: "How did we get here",
				es: "Cómo llegamos aquí",
				fr: "Comment est-ce qu'on est arrivés ici",
				it: "Come siamo arrivati qui",
				de: "Wie sind wir hierher gekommen?"
			},
			34: {
				en: "PAIR is a multinational technology company with offices in Japan, Singapore, Hong Kong, Tokyo, London, Paris and Madrid, but is headquartered in San Francisco, California. Headquartered in San Francisco, where the founder of the company was born, \"PAIR\" was founded in 1975 by James Pair Snr. James Pair snr has established himself on the world stage in the world of technology with his help in the revolutionary work of cloud computing or networked computing in the 60s. Unfortunately, James Pair sr died in 2013, leaving control of the company to the eldest son James Peer Jr.",
				es: "PAIR es una compañía de tecnología multinacional con oficinas en Japón, Singapur, Hong Kong, Tokio, Londres, París y Madrid, pero tiene su sede en San Francisco, California. Con sede en San Francisco, donde nació el fundador de la compañía, \"PAIR\" fue fundada en 1975 por James Pair Snr. James Pair snr se ha establecido en el escenario mundial del mundo de la tecnología con su ayuda en el trabajo revolucionario de la computación en la nube o la computación en red en los años 60. Desafortunadamente, James Pair sr murió en 2013, dejando el control de la compañía al hijo mayor James Peer Jr.",
				fr: "PAIR est une société multinationale de technologie qui possède des bureaux au Japon, à Singapour, à Hong Kong, à Tokyo, à Londres, à Paris et à Madrid. Son siège est à San Francisco, en Californie. Basée à San Francisco, où le fondateur de la société est née, \"PAIR\" a été fondée en 1975 par James Pair Snr. James Pair snr s'est établi sur la scène mondiale dans le monde de la technologie avec son aide dans le travail révolutionnaire de l'informatique en nuage ou de l'informatique en réseau dans les années 60. Malheureusement, James Pair sr est décédé en 2013, laissant le contrôle de l'entreprise au fils aîné James Peer Jr.",
				it: "PAIR è una società tecnologica multinazionale con uffici in Giappone, Singapore, Hong Kong, Tokyo, Londra, Parigi e Madrid, ma ha sede a San Francisco, in California. Con sede a San Francisco, dove è nato il fondatore dell'azienda, \"PAIR\" è stata fondata nel 1975 da James Pair Snr. James Pair snr si è affermato sulla scena mondiale nel mondo della tecnologia con il suo aiuto nel rivoluzionario lavoro di cloud computing o informatica in rete negli anni '60. Sfortunatamente, James Pair sr è morto nel 2013, lasciando il controllo dell'azienda al figlio maggiore James Peer Jr.",
				de: "PAIR ist ein multinationales Technologieunternehmen mit Niederlassungen in Japan, Singapur, Hongkong, Tokio, London, Paris und Madrid. Der Hauptsitz befindet sich in San Francisco, Kalifornien. \"PAIR\" hat seinen Hauptsitz in San Francisco, wo der Gründer des Unternehmens geboren wurde und wurde 1975 von James Pair Snr gegründet. James Pair snr hat sich mit seiner Hilfe in der revolutionären Arbeit des Cloud Computing oder des Networked Computing in den 60er Jahren auf der Weltbühne der Technologie etabliert. Leider starb James Pair sr im Jahr 2013 und überließ die Kontrolle über das Unternehmen dem ältesten Sohn James Peer Jr."
			},
			35: {
				en: "In 2019, James Pair Jr is in the early stages of moving the company's headquarters to a more strategic location in the United States of America to facilitate the company's production, distribution and communication. \"PAIR\" is one of the world's leading technology companies that develops, manufactures, licenses, supports and sells software, consumer electronics, personal computers and related technologies. As of 2019, \"PAIR\" employs 100,000 people worldwide. also ranked 62 in the 2018 fortune 500 ranking.",
				es: "En 2019, James Pair Jr se encuentra en las primeras etapas de trasladar la sede de la compañía a una ubicación más estratégica en los Estados Unidos de América para facilitar la producción, distribución y comunicación de la compañía. \"PAIR\" es una de las compañías de tecnología líderes en el mundo que desarrolla, fabrica, licencia, respalda y vende software, electrónica de consumo, computadoras personales y tecnologías relacionadas. A partir de 2019, \"PAIR\" emplea a 100,000 personas en todo el mundo. También ocupó el puesto 62 en el ranking Fortune 500 2018.",
				fr: "En 2019, James Pair Jr a commencé à déplacer le siège de la société vers un emplacement plus stratégique aux États-Unis d'Amérique afin de faciliter la production, la distribution et la communication de la société. \"PAIR\" est l'une des principales sociétés de technologie du monde qui développe, fabrique, concède sous licence, supporte et vend des logiciels, des produits électroniques grand public, des ordinateurs personnels et des technologies associées. En 2019, \"PAIR\" emploie 100 000 personnes dans le monde. également classé 62 dans le classement 2018 de la fortune 500.",
				it: "Nel 2019, James Pair Jr è nelle prime fasi di trasferimento della sede centrale dell'azienda in una posizione più strategica negli Stati Uniti d'America per facilitare la produzione, la distribuzione e la comunicazione dell'azienda. \"PAIR\" è una delle aziende tecnologiche leader a livello mondiale che sviluppa, produce, concede in licenza, supporta e vende software, elettronica di consumo, personal computer e tecnologie correlate. A partire dal 2019, \"PAIR\" impiega 100.000 persone in tutto il mondo. anche classificato 62 nella classifica fortuna 500 del 2018.",
				de: "Im Jahr 2019 befindet sich James Pair Jr. im Anfangsstadium des Umzugs des Hauptsitzes des Unternehmens an einen strategisch günstigeren Standort in den Vereinigten Staaten von Amerika, um die Produktion, den Vertrieb und die Kommunikation des Unternehmens zu vereinfachen. \"PAIR\" ist eines der weltweit führenden Technologieunternehmen, das Software, Unterhaltungselektronik, PCs und verwandte Technologien entwickelt, herstellt, lizenziert, unterstützt und vertreibt. Ab 2019 beschäftigt \"PAIR\" weltweit 100.000 Mitarbeiter. Ebenfalls auf Platz 62 im Fortune 500-Ranking 2018."
			},
			36: {
				en: "The company's core values ​​are strength through leadership, honesty, integrity, good ethics and diversity as an engine of innovation the 3 \"HR Champion of the Year\" awards, \"Outstanding Employee Network\" And \"Company of the Year\" at the 2018 European Diversity Awards. \"PAIR\" is also convinced of the need to fight climate change and reduce its carbon footprint worldwide. The company has reduced its carbon footprint by 25% since 2013 and hopes to continue this growth to 35% by 2022.",
				es: "Los valores centrales de la compañía son la fortaleza a través del liderazgo, la honestidad, la integridad, la buena ética y la diversidad como motor de innovación: los 3 premios \"HR Champion of the Year\", \"Outstanding Employee Network\" y \"Company of the Year\" en el 2018 Premios Europeos a la Diversidad. \"PAIR\" también está convencido de la necesidad de combatir el cambio climático y reducir su huella de carbono en todo el mundo. La compañía ha reducido su huella de carbono en un 25% desde 2013 y espera continuar este crecimiento hasta el 35% para 2022.",
				fr: "Les valeurs fondamentales de la société sont la force par le leadership, l'honnêteté, l'intégrité, la bonne éthique et la diversité en tant que moteur de l'innovation: les 3 «récompenses du champion des ressources humaines de l'année», le «réseau d'employés exceptionnels» et la «société de l'année» au 2018 Prix européens de la diversité. \"PAIR\" est également convaincu de la nécessité de lutter contre le changement climatique et de réduire son empreinte carbone dans le monde entier. La société a réduit son empreinte carbone de 25% depuis 2013 et espère poursuivre cette croissance à 35% d’ici 2022.",
				it: "I valori chiave dell'azienda sono la forza attraverso la leadership, l'onestà, l'integrità, la buona etica e la diversità come motore di innovazione, i 3 premi \"Campione delle risorse umane dell'anno\", \"Rete di dipendenti eccezionale\" e \"Azienda dell'anno\" al 2018 Premi europei sulla diversità. \"PAIR\" è anche convinto della necessità di combattere i cambiamenti climatici e ridurre la sua impronta di carbonio in tutto il mondo. La società ha ridotto la sua impronta di carbonio del 25% dal 2013 e spera di continuare questa crescita al 35% entro il 2022.",
				de: "Die Kernwerte des Unternehmens sind Stärke durch Führung, Ehrlichkeit, Integrität, gute Ethik und Vielfalt als Motor der Innovation, die mit den 3 Auszeichnungen \"HR Champion of the Year\", \"Outstanding Employee Network\" und \"Company of the Year\" im Jahr 2018 ausgezeichnet wurden European Diversity Awards. \"PAIR\" ist auch von der Notwendigkeit überzeugt, den Klimawandel zu bekämpfen und seinen weltweiten CO2-Fußabdruck zu verringern. Das Unternehmen hat seinen CO2-Fußabdruck seit 2013 um 25% reduziert und hofft, dieses Wachstum bis 2022 auf 35% fortzusetzen."
			},
			37: {
				en: "\"PAIR\" has always been a pioneer in the fields of technology and multimedia, offering young entrepreneurs the opportunity to develop next-generation technology. The most frequently asked question about \"PAIR\" is \"why pair?\", The answer is the meaning of the word \"pair\" literally means to connect and the logo of a pear symbolizes wisdom, health and inner peace.",
				es: "\"PAIR\" siempre ha sido pionero en los campos de tecnología y multimedia, ofreciendo a los jóvenes emprendedores la oportunidad de desarrollar tecnología de próxima generación. La pregunta más frecuente sobre \"PAR\" es \"¿por qué emparejar?\". La respuesta es que el significado de la palabra \"emparejar\" significa literalmente conectar y el logotipo de una pera simboliza la sabiduría, la salud y la paz interior.",
				fr: "\"PAIR\" a toujours été un pionnier dans les domaines de la technologie et du multimédia, offrant aux jeunes entrepreneurs la possibilité de développer une technologie de nouvelle génération. La question la plus fréquemment posée à propos de \"PAIR\" est \"pourquoi s'apparier?\", La réponse est la signification du mot \"paire\" signifie littéralement se connecter et le logo d'une poire symbolise la sagesse, la santé et la paix intérieure.",
				it: "\"PAIR\" è sempre stato un pioniere nel campo della tecnologia e del multimedia, offrendo ai giovani imprenditori l'opportunità di sviluppare la tecnologia di prossima generazione. La domanda più frequente su \"COPPIA\" è \"perché coppia?\", La risposta è il significato della parola \"coppia\" significa letteralmente connettersi e il logo di una pera simboleggia la saggezza, la salute e la pace interiore.",
				de: "\"PAIR\" war schon immer ein Vorreiter in den Bereichen Technologie und Multimedia und bot jungen Unternehmern die Möglichkeit, Technologien der nächsten Generation zu entwickeln. Die am häufigsten gestellte Frage zu \"PAAR\" lautet \"Warum ein Paar?\". Die Antwort lautet, dass das Wort \"Paar\" wörtlich \"verbinden\" bedeutet und das Logo einer Birne Weisheit, Gesundheit und inneren Frieden symbolisiert."
			},
			38: {
				en: "Competition....",
				es: "Competencia....",
				fr: "Concurrence....",
				it: "Concorrenza....",
				de: "Wettbewerb...."
			},
			39: {
				en: "WIN",
				es: "GANAR",
				fr: "GAGNER",
				it: "VINCERE",
				de: "SIEG"
			},
			40: {
				en: "To enter this competition, simply <a href='#dont_miss' class='scrollToEl'>Click Here!</a> and submit your email address",
				es: "Para participar en esta competencia, simplemente <a href='#dont_miss' class='scrollToEl'>¡Haga clic aquí!</a> y envíe su dirección de correo electrónico",
				fr: "Pour participer à ce concours, il suffit de <a href='#dont_miss' class='scrollToEl'>Cliquez ici!</a> et soumettez votre adresse email",
				it: "Per partecipare a questa competizione, semplicemente <a href='#dont_miss' class='scrollToEl'>Clicca qui!</a> e invia il tuo indirizzo email",
				de: "Um an diesem Wettbewerb teilzunehmen, einfach <a href='#dont_miss' class='scrollToEl'>Klicke hier!</a> und senden Sie Ihre E-Mail-Adresse"
			},
			41: {
				en: "Student email addresses will receive double entry on every submission",
				es: "Las direcciones de correo electrónico de los estudiantes recibirán doble entrada en cada envío",
				fr: "Les adresses électroniques des étudiants recevront une double entrée à chaque soumission.",
				it: "Gli indirizzi email degli studenti riceveranno una doppia iscrizione per ogni invio",
				de: "Studenten-E-Mail-Adressen erhalten bei jeder Einreichung einen doppelten Eintrag"
			},
			42: {
				en: "Exhibitors",
				es: "expositores",
				fr: "Aussteller",
				it: "espositori",
				de: "Aussteller"
			},
			43: {
				en: "Be sure to make time to visit our exhibitors, the innovators that have all helped shape technology to what we know an love today",
				es: "Asegúrese de hacer tiempo para visitar a nuestros expositores, los innovadores que han ayudado a dar forma a la tecnología a lo que hoy conocemos.",
				fr: "Assurez-vous de prendre le temps de visiter nos exposants, les innovateurs qui ont tous contribué à façonner la technologie en ce que nous connaissons aujourd'hui comme un amour",
				it: "Assicurati di trovare il tempo di visitare i nostri espositori, gli innovatori che hanno contribuito a plasmare la tecnologia a ciò che oggi conosciamo un amore",
				de: "Nehmen Sie sich Zeit, um unsere Aussteller zu besuchen, die Innovatoren, die alle dazu beigetragen haben, die Technologie so zu gestalten, wie wir sie heute lieben"
			},
			44: {
				en: "Don't Miss Out",
				es: "No te pierdas",
				fr: "Ne manquez pas",
				it: "Da non perdere",
				de: "Nicht verpassen"
			},
			45: {
				en: "Email Reminders",
				es: "Recordatorios por correo electrónico",
				fr: "Rappels par courriel",
				it: "Promemoria e-mail",
				de: "E-Mail-Erinnerungen"
			},
			46: {
				en: "Order a Ticket",
				es: "Pide un boleto",
				fr: "Commandez un billet",
				it: "Ordina un biglietto",
				de: "Ticket bestellen"
			},
			47: {
				en: "Information",
				es: "Información",
				fr: "Information",
				it: "Informazione",
				de: "Information"
			},
			48: {
				en: "About Us",
				es: "Sobre nosotros",
				fr: "À propos de nous",
				it: "Riguardo a noi",
				de: "Über uns"
			},
			49: {
				en: "<i class='far fa-square'></i>&nbsp;ABOUT US",
				es: "<i class='far fa-square'></i>&nbsp;Sobre nosotros",
				fr: "<i class='far fa-square'></i>&nbsp;À propos de nous",
				it: "<i class='far fa-square'></i>&nbsp;Riguardo a noi",
				de: "<i class='far fa-square'></i>&nbsp;Über uns"
			},
			50: {
				en: "Location",
				es: "Ubicación",
				fr: "Emplacement",
				it: "Posizione",
				de: "Ort"
			},
			51: {
				en: "Accessibility <i class=\"fas fa-universal-access\"></i>",
				es: "Accesibilidad <i class=\"fas fa-universal-access\"></i>",
				fr: "Accessibilité <i class=\"fas fa-universal-access\"></i>",
				it: "Accessibilità <i class=\"fas fa-universal-access\"></i>",
				de: "Zugänglichkeit <i class=\"fas fa-universal-access\"></i>"
			},
			52: {
				en: "<i class=\"fas fa-search\"></i> Toggle Text Size",
				es: "<i class=\"fas fa-search\"></i> Cambiar el tamaño del texto",
				fr: "<i class=\"fas fa-search\"></i> Basculer la taille du texte",
				it: "<i class=\"fas fa-search\"></i> Attiva / disattiva dimensioni testo",
				de: "<i class=\"fas fa-search\"></i> Textgröße umschalten"
			},
			53: {
				en: "<i class=\"fas fa-eye\"></i> Colour Overlay",
				es: "<i class=\"fas fa-eye\"></i> Superposición de color",
				fr: "<i class=\"fas fa-eye\"></i> Superposition de couleurs",
				it: "<i class=\"fas fa-eye\"></i> Sovrapposizione colore",
				de: "<i class=\"fas fa-eye\"></i> Farbüberlagerung"
			},
			54: {
				en: "<i class=\"far fa-closed-captioning\"></i> SubTitle",
				es: "<i class=\"far fa-closed-captioning\"></i> Subtitular",
				fr: "<i class=\"far fa-closed-captioning\"></i> Sous-titre",
				it: "<i class=\"far fa-closed-captioning\"></i> Sottotitolo",
				de: "<i class=\"far fa-closed-captioning\"></i> Untertitel"
			},
			55: {
				en: "5G The Future Connection",
				es: "5G La conexión futura",
				fr: "5G The Future Connection",
				it: "5G The Future Connection",
				de: "5G Die zukünftige Verbindung"
			},
			56: {
				en: "Research by Barclays shows that 5G technology could add 17.5 million to the economy by 2025.",
				es: "La investigación realizada por Barclays muestra que la tecnología 5G podría agregar 17,5 millones a la economía para 2025",
				fr: "Les recherches de Barclays montrent que la technologie 5G pourrait ajouter 17,5 millions à l'économie d'ici 2025",
				it: "La ricerca di Barclays mostra che la tecnologia 5G potrebbe aggiungere 17,5 milioni all'economia entro il 2025",
				de: "Untersuchungen von Barclays zeigen, dass die 5G-Technologie die Wirtschaft bis 2025 um 17,5 Millionen steigern könnte"
			},
			57: {
				en: "All major phone networking companies in UK involved plus other giants such as Apple are now investing into the technology.",
				es: "Todas las principales compañías de redes telefónicas en el Reino Unido involucradas, además de otros gigantes como Apple, ahora están invirtiendo en la tecnología.",
				fr: "Toutes les principales sociétés de réseautique téléphonique du Royaume-Uni et d'autres géants comme Apple investissent désormais dans la technologie.",
				it: "Tutte le principali società di reti telefoniche nel Regno Unito coinvolte e altri giganti come Apple stanno investendo nella tecnologia.",
				de: "Alle großen Telefongesellschaften in Großbritannien sowie andere Giganten wie Apple investieren jetzt in die Technologie."
			},
			58: {
				en: "Belfast is one of the only cities in the UK where 5G has been rolled out into however cover is limited now due it being early stages.",
				es: "Belfast es una de las pocas ciudades en el Reino Unido donde se ha implementado 5G, sin embargo, la cobertura es limitada ahora debido a que se encuentra en sus primeras etapas.",
				fr: "Belfast est l'une des seules villes du Royaume-Uni où la 5G a été déployée, mais la couverture est désormais limitée en raison de ses débuts.",
				it: "Belfast è una delle uniche città del Regno Unito in cui il 5G è stato implementato, ma la copertura è ora limitata a causa delle prime fasi.",
				de: "Belfast ist eine der wenigen Städte in Großbritannien, in denen 5G eingeführt wurde. Die Deckung ist jedoch derzeit begrenzt, da es sich um ein frühes Stadium handelt."
			},
			59: {
				en: "As well as benefiting consumers 5G could also benefit businesses in big ways. Workers will be able to work remotely more easily, operate machinery from afar and be more “present” without being present, through capabilities like 4K, AR, VR and holographic calls. In turn they’ll be able to free up more time and be more productive, as less travel will be needed, and when travel is needed 5G could speed that up too, thanks to smart and automated transport.",
				es: "Además de beneficiar a los consumidores, 5G también podría beneficiar a las empresas a lo grande. Los trabajadores podrán trabajar de forma remota con mayor facilidad, operar maquinaria desde lejos y estar más \"presentes\" sin estar presentes, a través de capacidades como 4K, AR, VR y llamadas holográficas. A su vez, podrán liberar más tiempo y ser más productivos, ya que se necesitarán menos viajes y, cuando sea necesario, 5G también podría acelerarlo, gracias al transporte inteligente y automatizado.",
				fr: "En plus de bénéficier aux consommateurs, la 5G pourrait également bénéficier aux entreprises de manière considérable. Les travailleurs pourront travailler à distance plus facilement, utiliser des machines à distance et être plus «présents» sans être présents, grâce à des capacités telles que 4K, AR, VR et les appels holographiques. À leur tour, ils pourront gagner plus de temps et être plus productifs, car moins de déplacements seront nécessaires, et lorsque des déplacements sont nécessaires, la 5G pourrait également accélérer cela, grâce à un transport intelligent et automatisé.",
				it: "Oltre a favorire i consumatori, il 5G potrebbe anche apportare vantaggi alle imprese in grandi modi. I lavoratori saranno in grado di lavorare in remoto più facilmente, utilizzare macchinari da lontano ed essere più \"presenti\" senza essere presenti, attraverso funzionalità come 4K, AR, VR e chiamate olografiche. A loro volta saranno in grado di liberare più tempo ed essere più produttivi, poiché saranno necessari meno viaggi e quando sarà necessario viaggiare, anche il 5G potrebbe accelerare, grazie a un trasporto intelligente e automatizzato.",
				de: "5G kann nicht nur den Verbrauchern zugute kommen, sondern auch den Unternehmen in großem Maße zugute kommen. Dank Funktionen wie 4K, AR, VR und holografischen Anrufen können Mitarbeiter einfacher aus der Ferne arbeiten, Maschinen aus der Ferne bedienen und „präsent“ sein, ohne anwesend zu sein. Im Gegenzug können sie mehr Zeit einsparen und produktiver arbeiten, da weniger Reisen erforderlich sind. Und wenn Reisen erforderlich sind, kann 5G dank intelligenter und automatisierter Transporte auch dies beschleunigen."
			},
			60: {
				en: "As noted above, 5G will enable network slicing too, which in turn will allow companies to essentially have their own private networks, tailored completely to their needs. And more jobs and processes can be automated with 5G, because it will have the speed, capacity and latency required, which will improve operational efficiency.5G could also better connect rural communities, opening more opportunities for businesses in these regions. 5G could even pave the way to whole new products and industries that aren’t viable with 4G. With all these benefits, 5G could create 22 million jobs, and lead to the production of up to $12.3 trillion (£9.3 trillion) of goods and services by 2035.",
				es: "Como se señaló anteriormente, 5G también permitirá el corte de la red, lo que a su vez permitirá a las empresas tener esencialmente sus propias redes privadas, adaptadas completamente a sus necesidades. Y se pueden automatizar más trabajos y procesos con 5G, porque tendrá la velocidad, la capacidad y la latencia requeridas, lo que mejorará la eficiencia operativa. 5G también podría conectar mejor a las comunidades rurales, abriendo más oportunidades para las empresas en estas regiones. 5G incluso podría allanar el camino a nuevos productos e industrias que no son viables con 4G. Con todos estos beneficios, 5G podría crear 22 millones de empleos y conducir a la producción de hasta $ 12.3 billones (£ 9.3 billones) de bienes y servicios para 2035.",
				fr: "Comme indiqué ci-dessus, la 5G permettra également le découpage de réseau, ce qui permettra aux entreprises d'avoir essentiellement leurs propres réseaux privés, entièrement adaptés à leurs besoins. Et plus de travaux et de processus peuvent être automatisés avec la 5G, car elle aura la vitesse, la capacité et la latence requises, ce qui améliorera l'efficacité opérationnelle. La 5G pourrait également mieux connecter les communautés rurales, ouvrant plus d'opportunités pour les entreprises de ces régions. La 5G pourrait même ouvrir la voie à de nouveaux produits et à de nouvelles industries qui ne sont pas viables avec la 4G. Avec tous ces avantages, la 5G pourrait créer 22 millions d'emplois et conduire à la production de 12,3 billions de dollars (9,3 billions de livres sterling) de biens et services d'ici 2035.",
				it: "Come notato in precedenza, il 5G consentirà anche il taglio della rete, che a sua volta consentirà alle aziende di avere essenzialmente le proprie reti private, completamente su misura per le loro esigenze. E più posti di lavoro e processi possono essere automatizzati con il 5G, perché avrà la velocità, la capacità e la latenza richieste, il che migliorerà l'efficienza operativa. Il 5G potrebbe persino aprire la strada a interi nuovi prodotti e settori che non sono praticabili con il 4G. Con tutti questi benefici, il 5G potrebbe creare 22 milioni di posti di lavoro e portare alla produzione di beni e servizi fino a $ 12,3 trilioni (£ 9,3 trilioni) entro il 2035.",
				de: "Wie bereits erwähnt, wird 5G auch Network Slicing ermöglichen, wodurch Unternehmen im Wesentlichen über ihre eigenen privaten Netzwerke verfügen können, die vollständig auf ihre Bedürfnisse zugeschnitten sind. Und mit 5G können mehr Jobs und Prozesse automatisiert werden, da es die erforderliche Geschwindigkeit, Kapazität und Latenz hat, was die betriebliche Effizienz verbessert.5G könnte auch ländliche Gemeinden besser verbinden und den Unternehmen in diesen Regionen mehr Möglichkeiten eröffnen. 5G könnte sogar den Weg für völlig neue Produkte und Branchen ebnen, die mit 4G nicht realisierbar sind. Mit all diesen Vorteilen könnte 5G 22 Millionen Arbeitsplätze schaffen und bis 2035 Waren und Dienstleistungen im Wert von bis zu 12,3 Billionen USD (9,3 Billionen GBP) produzieren."
			},
			61: {
				en: "With increasing demands for larger amounts of data it's a necessity to supply this need",
				es: "Con la creciente demanda de grandes cantidades de datos, es necesario satisfacer esta necesidad.",
				fr: "Avec des demandes croissantes pour de plus grandes quantités de données, il est nécessaire de répondre à ce besoin",
				it: "Con la crescente domanda di grandi quantità di dati è necessario soddisfare questa esigenza",
				de: "Bei steigendem Bedarf an größeren Datenmengen ist es notwendig, diesen Bedarf zu decken"
			},
			62: {
				en: "With latency being so high with other connection, 5G will open pathway for new technologies",
				es: "Con una latencia tan alta con otras conexiones, 5G abrirá el camino para nuevas tecnologías",
				fr: "Avec une latence si élevée avec d'autres connexions, la 5G ouvrira la voie à de nouvelles technologies",
				it: "Con una latenza così elevata rispetto ad altre connessioni, il 5G aprirà la strada a nuove tecnologie",
				de: "Da die Latenz bei anderen Verbindungen so hoch ist, wird 5G den Weg für neue Technologien ebnen"
			},
			63: {
				en: "To protect against software piracy, were all software will be hosted fully in the cloud",
				es: "Para protegerse contra la piratería de software, donde todo el software se alojará completamente en la nube",
				fr: "Pour vous protéger contre le piratage de logiciels, tous les logiciels seront-ils entièrement hébergés dans le cloud?",
				it: "Per proteggersi dalla pirateria del software, tutti i software saranno ospitati completamente nel cloud",
				de: "Zum Schutz vor Softwarepiraterie wird die gesamte Software vollständig in der Cloud gehostet"
			},
			64: {
				en: "With its high bandwidth, the devices we already use are crying out for this technology",
				es: "Con su gran ancho de banda, los dispositivos que ya utilizamos están pidiendo esta tecnología.",
				fr: "Avec sa bande passante élevée, les appareils que nous utilisons déjà réclament cette technologie",
				it: "Con la sua elevata larghezza di banda, i dispositivi che già utilizziamo chiedono questa tecnologia",
				de: "Die Geräte, die wir bereits einsetzen, sind mit ihrer hohen Bandbreite auf der Suche nach dieser Technologie"
			},
			65: {
				en: "It is the 5th generation phone network",
				es: "Es la red telefónica de quinta generación.",
				fr: "C'est le réseau téléphonique de 5ème génération",
				it: "È la rete telefonica di quinta generazione",
				de: "Es ist das Telefonnetz der 5. Generation"
			},
			66: {
				en: "Will be commercially rolled out in 2020",
				es: "Se lanzará comercialmente en 2020",
				fr: "Sera commercialement déployé en 2020",
				it: "Verrà lanciato commercialmente nel 2020",
				de: "Wird im Jahr 2020 kommerziell eingeführt"
			},
			67: {
				en: "Significantly faster than the current 4G network",
				es: "Significativamente más rápido que la red 4G actual",
				fr: "Beaucoup plus rapide que le réseau 4G actuel",
				it: "Significativamente più veloce dell'attuale rete 4G",
				de: "Deutlich schneller als das aktuelle 4G-Netz"
			},
			68: {
				en: "Response times with 5G is set to be 1 millisecond unlike 4G which is 50.",
				es: "Los tiempos de respuesta con 5G se establecen en 1 milisegundo a diferencia de 4G, que es 50.",
				fr: "Le temps de réponse avec la 5G est fixé à 1 milliseconde contrairement à la 4G qui est de 50.",
				it: "I tempi di risposta con 5G sono impostati su 1 millisecondo a differenza di 4G che è 50.",
				de: "Die Reaktionszeiten bei 5G sind im Gegensatz zu 4G (50) auf 1 Millisekunde eingestellt."
			},
			69: {
				en: "Up to 10Gbps at end points",
				es: "Hasta 10 Gbps en puntos finales",
				fr: "Jusqu'à 10 Gbit / s aux points d'extrémité",
				it: "Fino a 10 Gbps ai punti finali",
				de: "Bis zu 10 Gbit / s an den Endpunkten"
			},
			70: {
				en: "Advantages",
				es: "Ventajas",
				fr: "Les avantages",
				it: "vantaggi",
				de: "Vorteile"
			},
			71: {
				en: "Response times with 5G is set to be 1 millisecond unlike 4G which is 50.",
				es: "Los tiempos de respuesta con 5G se establecen en 1 milisegundo a diferencia de 4G, que es 50.",
				fr: "Le temps de réponse avec la 5G est fixé à 1 milliseconde contrairement à la 4G qui est de 50.",
				it: "I tempi di risposta con 5G sono impostati su 1 millisecondo a differenza di 4G che è 50.",
				de: "Die Reaktionszeiten bei 5G sind im Gegensatz zu 4G (50) auf 1 Millisekunde eingestellt."
			},
			72: {
				en: "Larger bandwidth, Up to 10Gbps at end points",
				es: "Mayor ancho de banda, hasta 10 Gbps en puntos finales",
				fr: "Bande passante plus grande, jusqu'à 10 Gbit / s aux points d'extrémité",
				it: "Larghezza di banda maggiore, fino a 10 Gbps ai punti finali",
				de: "Größere Bandbreite, bis zu 10 Gbit / s an den Endpunkten"
			},
			73: {
				en: "Possible to provide a uniform, consistent and uninterrupted, connectivity across the world",
				es: "Posible proporcionar una conectividad uniforme, consistente e ininterrumpida en todo el mundo",
				fr: "Possible de fournir une connectivité uniforme, cohérente et ininterrompue à travers le monde",
				it: "È possibile fornire una connettività uniforme, coerente e ininterrotta in tutto il mondo",
				de: "Es ist möglich, weltweit eine einheitliche, konsistente und unterbrechungsfreie Konnektivität bereitzustellen"
			},
			74: {
				en: "Technology is capable to gather all networks to a single platform",
				es: "La tecnología es capaz de reunir todas las redes en una sola plataforma.",
				fr: "La technologie est capable de rassembler tous les réseaux sur une seule plateforme",
				it: "La tecnologia è in grado di riunire tutte le reti su un'unica piattaforma",
				de: "Die Technologie ist in der Lage, alle Netzwerke auf einer einzigen Plattform zusammenzuführen"
			},
			75: {
				en: "Easier manageability with previous generations",
				es: "Facilidad de manejo con generaciones anteriores",
				fr: "Facilité de gestion avec les générations précédentes",
				it: "Gestibilità più semplice con le generazioni precedenti",
				de: "Einfachere Verwaltbarkeit mit früheren Generationen"
			},
			76: {
				en: "Business that are trialing 5G",
				es: "Negocios que están probando 5G",
				fr: "Entreprises qui testent la 5G",
				it: "Aziende che stanno testando il 5G",
				de: "Unternehmen, die 5G testen"
			},
			77: {
				en: "Download High Definition movies in seconds rather than minutes",
				es: "Descarga películas de alta definición en segundos en lugar de minutos",
				fr: "Téléchargez des films haute définition en quelques secondes plutôt qu'en quelques minutes",
				it: "Scarica i film in alta definizione in pochi secondi anziché in minuti",
				de: "Laden Sie High Definition-Filme in Sekunden statt in Minuten herunter"
			},
			78: {
				en: "",
				es: "",
				fr: "",
				it: "",
				de: ""
			},
			79: {
				en: "",
				es: "",
				fr: "",
				it: "",
				de: ""
			},
			80: {
				en: "",
				es: "",
				fr: "",
				it: "",
				de: ""
			}
		},
		ticketImage: {
			1: 'assets/media/ticket_images/platinum_ticket.png',
			2: 'assets/media/ticket_images/enthusiast_ticket.png',
			3: 'assets/media/ticket_images/dev_ticket.png',
			4: 'assets/media/ticket_images/student_ticket.png',
		}
		
	}
	
	
};

// Load data from json server on every page load
(function () {
	
	'use strict';
	
	window.onload = () => {
		
		//Pair_Event.ajax.get()
		Pair_Event.utils.headerShrink()
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
	let timer = new Date();
	
	let initialInitialize = Pair_Event.storage.get('initial_popup');

	let timerStopper = parseInt( initialInitialize )+ (2*60*1000);

	if (!initialInitialize || timer.getTime() >= timerStopper  ) {
		setTimeout(() => {
			document.getElementById('initial_popup').style.display = 'grid';
			Pair_Event.storage.store('initial_popup', timer.getTime());
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
			let needsDropped = document.getElementById('small_screen_dropdown');

			document.getElementById(evt.dataset.modalType).style.display = 'grid';

			if(evt.dataset.smallMenuClicker !== undefined){
					needsDropped.classList.toggle('openIt')
			}
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
				hoverpause: false,
				keyboard: false
			}).mount();
			
			Pair_Event.holders.cart_n_glide.disable();
			
		});
	}
})();

// Close basket
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

// Scroll To Element
(function () {
	
	'use strict';
	
	let showHome = document.querySelectorAll('.scroller');
	for (let i = 0; i < showHome.length; i++) {
		showHome[i].addEventListener('click', (evt) => {
			evt.preventDefault();
			Pair_Event.utils.scrollDown(showHome[i])
		})
	}
	
})();

// Scroll to about us
(function () {
	
	'use strict';
	
	let showAboutUs = document.getElementById('scroller_about_us');

		showAboutUs.addEventListener('click', (evt) => {
			evt.preventDefault();
	
			Pair_Event.utils.scrollDown(showAboutUs)
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
		hoverpause: false,
		keyboard: false,
		breakpoints: {
			767: {
				perView: 4
			}
		}
	}).mount()
	
})();

// Notification of event updates
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
						let isStudent = new RegExp(/[a-zA-z_\-$%£^]{3,}@[a-zA-Z]{3,}.(ac|edu).[a-zA-Z]{2,3}/);
						if (!Pair_Event.utils.isEmail(paymentEmail)) {
							notifierObject.push({
								target: "cartPersonEmailValid",
								message: "Invalid email provided",
								isSuccess: false
							});
						}
						
						if (Pair_Event.utils.hasStudent(thisCart)) {
							if (!isStudent.test(paymentEmail)) {
								notifierObject.push({
									target: "cartPersonStudentEmailValid",
									message: "Authentic student email addresses are needed to purchase some items in your cart ",
									isSuccess: false
								});
							}
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
							html += `<section><figure>${thisCart.orderItems[i].title}: &nbsp;&nbsp;</figure><figure>#${thisCart.orderItems[i].quantity}</figure></section>`
						}
						
						displayPurchase.innerHTML = html;
						
						moveForward()
					}
					
					break;
				case "3":
					document.location.reload();
					break;
				default:
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
		} else {
			if (!Pair_Event.utils.isEmail(contactEmail)) {
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
		
		if (notifierObject.length > 0) {
			Pair_Event.utils.notifier(notifierObject)
		} else {
			Pair_Event.utils.notifier({
				target: 'contact_form',
				message: "Message sent successfully",
				isSuccess: true
			});
			
			setTimeout(() => document.location.reload(), 3000)
		}
	})
	
})();

// Translator
(function () {
	
	'use strict';
	
	let translators = document.querySelectorAll('.translator_selector');
	
	for (let i = 0; i < translators.length; i++) {
		translators[i].addEventListener('click', (evt) => {
			let target = evt.target;
			let data = target.dataset;
			let srcHolder = translators[0].src;
			let titleHolder = translators[0].title;
			let transLangHolder = translators[0].dataset.transLang;
			
			Pair_Event.utils.translated(data.transLang, Pair_Event.holders.translations);
			
			translators[0].alt = translators[i].alt;
			translators[0].title = translators[i].alt;
			translators[0].src = translators[i].src;
			translators[0].setAttribute('data-trans-lang', translators[i].dataset.transLang);
			
			translators[i].alt = titleHolder;
			translators[i].title = titleHolder;
			translators[i].src = srcHolder;
			translators[i].setAttribute('data-trans-lang', transLangHolder);
			
			
		})
	}
	
})();

// Small menu Translator
(function () {
	"use strict";

	let smallTranslator = document.querySelectorAll('.transSelections');
	let needsDropped = document.getElementById('small_screen_dropdown');

	for (let i = 0; i < smallTranslator.length; i++) {
		smallTranslator[i].addEventListener('click', (evt) => {
			let data = evt.target.dataset;

			if(data.transLang !== undefined){
				Pair_Event.utils.translated(data.transLang, Pair_Event.holders.translations)
			}

			if(data.smallMenuClicker !== undefined){
				needsDropped.classList.toggle('openIt')
			}
		})
	}

})();

// Share us Slide out
(function () {
	
	'use strict';
	
	let shareSlide = document.getElementById('shareUsSlide');
	let shareHolder = document.querySelector('#bg_holder .shareus_wrapper');
	let shareClicker = document.querySelectorAll('.shareUsClicker');
	
	shareSlide.addEventListener('click', () => {
		
		if (shareHolder.style.left === "-11px") {
			shareHolder.style.left = '-84px';
			
		} else {
			shareHolder.style.left = '-11px';
		}
	});
	
	for (let i = 0; i < shareClicker.length; i++) {
		shareClicker[i].addEventListener('click', () => {
			setTimeout(() => shareHolder.style.left = '-84px', 700)
		})
	}
	
	
})();

// Accessibility us Slide out
(function () {
	
	'use strict';
	
	let accessSlide = document.getElementById('accessUsSlide');
	let accessHolder = document.querySelector('#access_holder .access_wrapper');
	let accessClicker = document.querySelectorAll('.accessUsClicker');
	
	accessSlide.addEventListener('click', () => {
		
		if (accessHolder.style.right === "-11px") {
			accessHolder.style.right = '-160px';
			
		} else {
			accessHolder.style.right = '-11px';
		}
	});
	
	for (let i = 0; i < accessClicker.length; i++) {
		accessClicker[i].addEventListener('click', () => {
			setTimeout(() => accessHolder.style.right = '-160px', 700)
		})
	}
	
	
})();

// Accessibility actions
(function () {
	"use strict";

	let accessAction = document.querySelectorAll('.accessUsClicker');

	for (let i = 0; i < accessAction.length; i++) {

		accessAction[i].addEventListener('click', (evt)=> {
			let target = evt.target;
			let data = target.dataset;

			switch(data.accessType){
				case 'zoom':

					Pair_Event.utils.addToFontClass();

					break;
				case 'overlay':
					Pair_Event.utils.addToBackGroundColor();
					break;
				case 'subtitles':

					break;
				default:
					break;
			}
		})

	}

})();

// Why Attend slider
(function () {
	
	'use strict';
	
	
	let whyAttendSlider = new Glide('#whyAttendSlider', {
		type: 'slider',
		startAt: 0,
		perView: 1,
		autoplay: 7000,
		animationDuration: 2000
	}).mount();
	
})();

// Small header initialize dropdown
(function (){

    'use strict';

    let smallDropper = document.getElementById('small_dropdown');
    let needsDropped = document.getElementById('small_screen_dropdown');

	smallDropper.addEventListener('click', (evt) => {
		
		needsDropped.classList.toggle('openIt')
	
	});

	
})();

