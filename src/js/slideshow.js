import { ContentItem } from './contentItem';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);
import { Observer } from 'gsap/Observer';
gsap.registerPlugin(Observer);

const body = document.body;

let winsize = {width: window.innerWidth, height: window.innerHeight};
window.addEventListener('resize', () => {
	winsize = {width: window.innerWidth, height: window.innerHeight};
});

/**
 * Class representing the Slideshow
 */
export class Slideshow {
	// DOM elements
	DOM = {
		// main element (.stack)
		el: null,
		// stack items (.stack__item)
		items: null,

		// the DOM location of the .stacks element when the slideshow is closed
		stackWrap: document.querySelector('.stack-wrap'),
		// the DOM location of the .stacks element when the slideshow is open
		slides: document.querySelector('.slides'),
		
		// .content element
		content: document.querySelector('.content'),
		// the content items (.content__item)
		contentItems: [...document.querySelectorAll('.content__item')],
		
		// the main title ("Photography")
		mainTitleTexts: [...document.querySelectorAll('.title > .oh > .oh__inner')],

		// back control (.content__back)
		backCtrl: document.querySelector('.content__back'),
		// navigation (.content__nav-wrap)
		nav: document.querySelector('.content__nav-wrap'),
		// navigation arrows
		navArrows: {
			prev: document.querySelector('.content__nav--prev'),
			next: document.querySelector('.content__nav--next'),
		}
	}
	// Content instances
	contentItems = [];
	// Check is Slishow is in open mode or closed mode
	isOpen = false;
	// Current item's position
	current = -1;
	// Total items
	totalItems = 0;
	// items gap (CSS variable)
	gap = getComputedStyle(document.documentElement).getPropertyValue('--slide-gap');

	/**
	 * Constructor.
	 * @param {NodeList} DOM_el - main element (.stack)
	 */
	constructor(DOM_el) {
		this.DOM.el = DOM_el;
		
		this.DOM.items = [...this.DOM.el.querySelectorAll('.stack__item:not(.stack__item--empty)')];
		this.totalItems = this.DOM.items.length;
		this.DOM.contentItems.forEach(item => this.contentItems.push(new ContentItem(item)));

		this.initEvents();
	}
	/**
	 * Event binding.
	 */
	initEvents() {
		
		this.DOM.items.forEach((item, position) => {
			// Clicking on a stack item reveals the slideshow navigation and the item's content
			item.addEventListener('click', () => {
				// Show the item's content
				this.open(item);
			});
		});

		this.DOM.backCtrl.addEventListener('click', () => {
			this.close();
		});

		this.DOM.navArrows.next.addEventListener('click', () => {
			this.navigate('next');
		});
		this.DOM.navArrows.prev.addEventListener('click', () => {
			this.navigate('prev');
		});

		// Trigger the close() on scroll by using the gsap observer plugin
		const scrollFn = () => {
			if ( this.isOpen && !this.isAnimating ) {
				this.close();
				this.scrollObserver.disable();
			}
		}
		this.scrollObserver = Observer.create({
			type: 'wheel,touch,pointer',
			wheelSpeed: -1,
			onDown: scrollFn,
			onUp: scrollFn,
			tolerance: 10,
			preventDefault: true,
		})
		this.scrollObserver.disable();

	}
	/**
	 * Opens the slideshow navigation and reveals the item's content.
	 * @param {NodeList} stackItem - the clicked item
	 */
	open(stackItem) {

		if ( this.isAnimating || this.isOpen ) {
			return;
		}
		this.isAnimating = true;
		
		// Update the current value
		this.current = this.DOM.items.indexOf(stackItem);

		// enable the observer (closes teh slideshow on scroll/touch)
		this.scrollObserver.enable();

		const scrollY = window.scrollY;
		
		body.classList.add('oh');
		this.DOM.content.classList.add('content--open');
		
		// set CSS current classes to both content and stack item elements
		this.contentItems[this.current].DOM.el.classList.add('content__item--current');
		this.DOM.items[this.current].classList.add('stack__item--current');

		const state = Flip.getState(this.DOM.items, {props: 'opacity'});
		this.DOM.slides.appendChild(this.DOM.el);

		const itemCenter = stackItem.offsetTop + stackItem.offsetHeight/2;
		
		// seems to solve a bug in firefox
		document.documentElement.scrollTop = document.body.scrollTop = 0;

		gsap.set(this.DOM.el, {
			y: winsize.height/2 - itemCenter + scrollY
		});		
		
		// seems to solve a bug in firefox
		document.documentElement.scrollTop = document.body.scrollTop = 0;

		// Flip
		Flip.from(state, {
			duration: 1,
			ease: 'expo',
			onComplete: () => {
				this.isOpen = true;
				this.isAnimating = false;
			},
			// seems to solve a bug in firefox
			onStart: () => document.documentElement.scrollTop = document.body.scrollTop = scrollY,
			absoluteOnLeave: true,
		})
		.to(this.DOM.mainTitleTexts, {
			duration: .9,
			ease: 'expo',
			yPercent: -101
		}, 0)
		.to(this.contentItems[this.current].DOM.texts, {
			duration: 1,
			ease: 'expo',
			startAt: {yPercent: 101},
			yPercent: 0
		}, 0)
		.to(this.DOM.backCtrl, {
			duration: 1,
			ease: 'expo',
			startAt: {opacity: 0},
			opacity: 1
		}, 0)
		.to([this.DOM.navArrows.prev, this.DOM.navArrows.next], {
			duration: 1,
			ease: 'expo',
			startAt: {
				opacity: 0,
				y: pos => pos ? -150 : 150
			},
			y: 0,
			opacity: pos => this.current === 0 && !pos || this.current === this.totalItems-1 && pos ? 0 : 1
		}, 0);

	}
	/**
	 * Closes the slideshow navigation and hides the content
	 */
	close() {

		if ( this.isAnimating || !this.isOpen ) {
			return;
		}
		this.isAnimating = true;

		this.scrollObserver.disable();

		this.DOM.items[this.current].classList.remove('stack__item--current');

		body.classList.remove('oh');
		
		const state = Flip.getState(this.DOM.items, {props: 'opacity'});
		this.DOM.stackWrap.appendChild(this.DOM.el);

		gsap.set(this.DOM.el, {
			y: 0
		});

		// Flip
		Flip.from(state, {
			duration: 1,
			ease: 'expo',
			onComplete: () => {
				this.DOM.content.classList.remove('content--open');
				this.contentItems[this.current].DOM.el.classList.remove('content__item--current');

				this.current = -1;
				this.isOpen = false;
				this.isAnimating = false;
			},
			absoluteOnLeave: true
		})
		.to(this.DOM.mainTitleTexts, {
			duration: .9,
			ease: 'expo',
			startAt: {yPercent: 101},
			yPercent: 0
		}, 0)
		.to(this.contentItems[this.current].DOM.texts, {
			duration: 1,
			ease: 'expo',
			yPercent: -101
		}, 0)
		.to(this.DOM.backCtrl, {
			duration: 1,
			ease: 'expo',
			opacity: 0
		}, 0)
		.to([this.DOM.navArrows.prev, this.DOM.navArrows.next], {
			duration: 1,
			ease: 'expo',
			y: pos => pos ? 100 : -100,
			opacity: 0
		}, 0);
	}
	/**
	 * Navigation
	 * @param {String} direction 'prev' || 'next'
	 */
	navigate(direction) {
		
		if ( this.isAnimating || (direction === 'next' && this.current === this.totalItems-1) || (direction === 'prev' && this.current === 0) ) return;
		this.isAnimating = true;

		const previousCurrent = this.current;
		const currentItem = this.DOM.items[previousCurrent];
		this.current = direction === 'next' ? this.current+1 : this.current-1
		const upcomingItem = this.DOM.items[this.current];
		
		currentItem.classList.remove('stack__item--current');
		upcomingItem.classList.add('stack__item--current');

		// show/hide arrows
		gsap.set(this.DOM.navArrows.prev, {opacity: this.current > 0 ? 1 : 0});
		gsap.set(this.DOM.navArrows.next, {opacity: this.current < this.totalItems-1 ? 1 : 0});
		
		gsap.timeline()
		.to(this.DOM.el, {
			duration: 1,
			ease: 'expo',
			y: direction === 'next' ? `-=${winsize.height/2 + winsize.height*.02}` : `+=${winsize.height/2 + winsize.height*.02}`,
			onComplete: () => {
				this.isAnimating = false;
			}
		})
		.to(this.contentItems[previousCurrent].DOM.texts, {
			duration: .2,
			ease: 'power1',
			yPercent: direction === 'next' ? 101 : -101,
			onComplete: () => this.contentItems[previousCurrent].DOM.el.classList.remove('content__item--current')
		}, 0)
		.to(this.contentItems[this.current].DOM.texts, {
			duration: .9,
			ease: 'expo',
			startAt: {yPercent: direction === 'next' ? -101 : 101},
			onStart: () => this.contentItems[this.current].DOM.el.classList.add('content__item--current'),
			yPercent: 0
		}, .2)
	}
}