const destinations = [
  {name:'Paris',focus:'center 25%',country:'France',price:899,icon:'🗼',bg:'linear-gradient(135deg,#f6d5a8,#e49b36)'},
  {name:'Tokyo',focus:'center 50%',country:'Japan',price:1199,icon:'🗾',bg:'linear-gradient(135deg,#fbc7d4,#e86a8a)'},
  {name:'New York',focus:'center 40%',country:'USA',price:999,icon:'🗽',bg:'linear-gradient(135deg,#bcd4f0,#4a7bc0)'},
  {name:'Cairo',focus:'center 55%',country:'Egypt',price:599,icon:'🏜️',bg:'linear-gradient(135deg,#f3e1a6,#c9983a)'},
  {name:'Rome',focus:'center 50%',country:'Italy',price:849,icon:'🏛️',bg:'linear-gradient(135deg,#d9c8f0,#8a6cc4)'},
  {name:'Dubai',focus:'center 35%',country:'UAE',price:1099,icon:'🏙️',bg:'linear-gradient(135deg,#bfe6dc,#3aa58f)'}
];

const money = n => '$' + n.toLocaleString('en-US');

// Load images/<place name>.jpg (e.g. images/tokyo.jpg); falls back to the gradient + emoji
function loadImage(img, name) {
  const box = img.parentElement;
  const base = name.toLowerCase();
  const tries = [`images/${base}.jpg`, `images/${base.replace(/\s+/g, '-')}.jpg`].map(encodeURI);
  let i = 0;
  box.classList.remove('has-img');
  img.hidden = false;
  img.onload = () => {
    box.style.setProperty('--img', `url("${img.currentSrc || img.src}")`);
    box.classList.add('has-img');
  };
  img.onerror = () => {
    i++;
    if (i < tries.length) img.src = tries[i];
    else { img.onerror = null; img.hidden = true; }
  };
  img.src = tries[0];
}

// Render destination cards
const cards = document.getElementById('cards');
cards.innerHTML = destinations.map((d, i) => `
  <article class="card">
    <div class="card-img" style="background:${d.bg}">
      <span class="emoji">${d.icon}</span>
      <img alt="${d.name}, ${d.country}" data-i="${i}" loading="lazy" style="object-position:${d.focus}">
    </div>
    <div class="card-body">
      <h3>${d.name}</h3>
      <p>${d.country}</p>
      <div class="card-foot"><span>From ${money(d.price)}</span><button data-i="${i}">Book</button></div>
    </div>
  </article>`).join('');
cards.querySelectorAll('.card-img img').forEach(img => loadImage(img, destinations[img.dataset.i].name));

// Booking modal
const modal = document.getElementById('modal');
const form = document.getElementById('bookingForm');
const $ = id => document.getElementById(id);
let current = null;

function updateTotal() {
  const g = Math.max(1, parseInt($('bkGuests').value) || 1);
  $('bkTotal').textContent = money(current.price * g);
}

function openModal(d) {
  current = d;
  $('bkCity').textContent = d.name;
  $('bkCountry').textContent = d.country;
  $('bkEmoji').textContent = d.icon;
  $('bkMedia').style.background = d.bg;
  $('bkImg').alt = `${d.name}, ${d.country}`;
  $('bkImg').style.objectPosition = d.focus;
  loadImage($('bkImg'), d.name);
  $('bk-title').textContent = `Book your trip to ${d.name}`;
  form.reset();
  $('bkDate').min = new Date().toISOString().split('T')[0];
  $('bkError').textContent = '';
  $('bkFormWrap').hidden = false;
  $('bkSuccess').hidden = true;
  updateTotal();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('bkName').focus(), 100);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cards.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn) openModal(destinations[btn.dataset.i]);
});
$('modalClose').addEventListener('click', closeModal);
$('bkDone').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
$('bkGuests').addEventListener('input', updateTotal);

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('bkName').value.trim();
  const email = $('bkEmail').value.trim();
  const phone = $('bkPhone').value.trim();
  const date = $('bkDate').value;
  const guests = parseInt($('bkGuests').value);
  let err = '';
  if (name.length < 2) err = 'Please enter your full name.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = 'Please enter a valid email address.';
  else if (!/^[+\d][\d\s\-()]{6,}$/.test(phone)) err = 'Please enter a valid phone number.';
  else if (!date || date < $('bkDate').min) err = 'Please choose a valid travel date.';
  else if (!guests || guests < 1 || guests > 10) err = 'Travelers must be between 1 and 10.';
  $('bkError').textContent = err;
  if (err) return;

  const when = new Date(date + 'T00:00').toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'});
  $('bkSuccessMsg').textContent = `Thanks ${name.split(' ')[0]}! Your trip to ${current.name} for ${guests} traveler${guests > 1 ? 's' : ''} on ${when} is reserved. Total: ${money(current.price * guests)}. A confirmation will be sent to ${email}.`;
  $('bkFormWrap').hidden = true;
  $('bkSuccess').hidden = false;
});

// Sticky header shadow
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20));

// Mobile menu
const menu = document.getElementById('menu');
document.getElementById('burger').addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Active link on scroll
const links = [...menu.querySelectorAll('a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
addEventListener('scroll', () => {
  let idx = 0;
  sections.forEach((s, i) => { if (scrollY + 140 >= s.offsetTop) idx = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === idx));
});

document.getElementById('year').textContent = new Date().getFullYear();
