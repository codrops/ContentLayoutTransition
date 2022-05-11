import { preloadImages } from './utils';
import { Slideshow } from './slideshow';

const slideshow = new Slideshow(document.querySelector('.stack'));

// Preload images
preloadImages('.stack__item').then( _ => document.body.classList.remove('loading'));