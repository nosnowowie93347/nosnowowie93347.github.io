const menuItems = document.querySelectorAll('ul.menu li a');
const clickCatchers = document.querySelectorAll('.catcher');
const yesBtns = document.querySelectorAll('a.btn__yes');
const noBtns = document.querySelectorAll('a.btn__no');
let activeListItem = null;


Array.from(yesBtns).forEach(b => {
    b.addEventListener('click', e => {
        console.log("canceled button click");
        e.preventDefault();
    });
});
Array.from(noBtns).forEach(b => {
    b.addEventListener('click', e => {
        console.log("canceled button click");
        e.preventDefault();
    });
});

Array.from(menuItems).forEach(m => {
    m.addEventListener('click', e => activateOverlay(e));
});

Array.from(clickCatchers).forEach(c => {
    c.addEventListener('click', e => closeOverlay(e));
});


// function confirm(e) {
    
// }

// function cancel(e) {
    
// }

function activateOverlay(event) {
    event.preventDefault();
    
    activeListItem = event.target;
    event.target.classList.add('active');
    const overlayName = event.target.getAttribute('data-overlay-activate');
    const overlayEl = document.querySelector(`.js-overlay-${overlayName}`);
    overlayEl.classList.add('active');
}

function closeOverlay(event) {
    event.preventDefault();
    
    activeListItem.classList.remove('active');
    const overlayName = event.target.getAttribute('data-overlay-close');
    const overlayEl = document.querySelector(`.js-overlay-${overlayName}`);
    overlayEl.classList.remove('active');
}