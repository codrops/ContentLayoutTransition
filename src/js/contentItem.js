/**
 * Class representing a Content Item
 */
 export class ContentItem {
    // DOM elements
	DOM = {
		// main element (.content__item)
		el: null,
        // title (.content__item-title)
        title: null,
        // description (.content__item-description)
        description: null,
        // all .oh__inner text spans that will animate in/out
        texts: null
	}
    
    /**
	 * Constructor.
	 * @param {NodeList} DOM_el - main element (.content__item)
	 */
	constructor(DOM_el) {
		this.DOM.el = DOM_el;
        this.DOM.title = this.DOM.el.querySelector('.content__item-title');
        this.DOM.description = this.DOM.el.querySelector('.content__item-description');

        this.DOM.texts = [...this.DOM.el.querySelectorAll('.oh > .oh__inner')];
	}
}