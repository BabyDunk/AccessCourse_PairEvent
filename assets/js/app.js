Pair_Event = {
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
	scrollDown: (el) => {
		let speed = 10;
		let actionScroll = setInterval(moveScroll, 1);
		
		function moveScroll() {
			let to = document.scrollingElement;
			let stopper = document.querySelector(el.hash).offsetTop;
			stopper = Math.floor(stopper /= speed) * speed;
			
			let mover = to.scrollTop;
			mover = Math.floor(mover /= speed) * speed;
			
			let bottomStop = Math.floor((to.scrollHeight - to.clientHeight) / speed) * speed;
			
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
	digitCounterClimber: (el) => {
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
			console.dir(This.parentElement.parentElement.parentElement)
		})
	}
	
})();

// Initial Popup
(function () {
	
	'use strict';
	
	//Pair_Event.remove('initial_popup');
	if (Boolean(Pair_Event.get('initial_popup')) !== true) {
		setTimeout(() => {
			document.getElementById('initial_popup').style.display = 'grid';
			Pair_Event.store('initial_popup', true);
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

// Scroll to theExperts
(function () {
	
	'use strict';
	
	let showExperts = document.getElementById('meet_the_experts_opener');
	showExperts.addEventListener('click', (evt) => {
		evt.preventDefault();
		Pair_Event.scrollDown(showExperts)
	})
	
})();

// Carousel
(function () {
	
	'use strict';
	
	let sponsors = document.getElementById('sponsors');
	let scrollItems = sponsors.children;
	let elArray = [];
	for (let x = 0; x < scrollItems.length; x++) {
		elArray.push(scrollItems[x])
	}
	
	let full = elArray.concat(elArray.slice());
	let fuller = full.concat(full.slice());
	//console.dir(fuller);
	
	for (let x = 0; x < fuller.length; x++) {
		sponsors.innerHTML += `<img class="${fuller[x].className}" src="${fuller[x].src}" alt="${fuller[x].alt}">`;
	}
	
})();

// Notification of event updates
// TODO: Needs completed. Need to create a function to validate email address format
(function () {
	
	'use strict';
	
	let getNotified = document.getElementById('get_notified');
	let getNotifiedAddress = document.getElementById('get_notified_address');
	
	getNotified.addEventListener('click', (evt) => {
		evt.preventDefault();
		
		let emailValidation = getNotifiedAddress.value;
		if (emailValidation === '') {
			console.log('Need to provide an Email')
		} else if (typeof emailValidation === String) {
			console.log('Is string')
		}
	})
	
})();

(function () {
	
	'use strict';
	
	let counterEl = document.querySelectorAll('.attendance_counter');
	
	//Pair_Event.digitCounterClimber(counterEl[2])
	for(let x=0; x<counterEl.length; x++){
	 Pair_Event.digitCounterClimber(counterEl[x])
	 }
	
})();