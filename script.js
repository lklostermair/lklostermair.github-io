// script.js — tabs swap content in-place; pubs demo plumbing
// Last updated is shown in footer.
const updated = document.getElementById('updated');
if (updated) updated.textContent = new Date(document.lastModified).toLocaleDateString();

// --- Tabs (top-nav) ---
const tablist = document.querySelector('.top-nav[role="tablist"]');
const tabs = [...document.querySelectorAll('.top-nav [role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function activateTab(tab, pushHash = true) {
  // aria state
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  // panels
  panels.forEach(p => p.classList.toggle('active', p.id === tab.getAttribute('aria-controls')));
  // URL state (no scroll)
  if (pushHash) {
    const hash = tab.id.replace('tab-',''); // e.g., iprl
    history.replaceState(null, '', `#${hash}`);
  }
}

function getTabByHash(hash) {
  return tabs.find(t => t.id === `tab-${hash}`);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = tabs[(i + 1) % tabs.length];
      next.focus(); activateTab(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = tabs[(i - 1 + tabs.length) % tabs.length];
      prev.focus(); activateTab(prev);
    } else if (e.key === 'Home') {
      e.preventDefault(); tabs[0].focus(); activateTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault(); tabs[tabs.length - 1].focus(); activateTab(tabs[tabs.length - 1]);
    }
  });
});

// Hash deep-link support (e.g., /#publications)
function initFromHash() {
  const raw = (location.hash || '').replace('#','').trim();
  const valid = raw && getTabByHash(raw);
  activateTab(valid || tabs[0], false);
}
window.addEventListener('hashchange', initFromHash);
initFromHash();

// --- Publications demo data + filter wiring (optional; safe to remove if unused) ---
const PUBLICATIONS = [
  // Example entries:
  // { title: "Paper Title", authors: "A. Author, B. Author", venue: "Conf 2025", year: 2025, link: "#", tags: ["grasping","perception"] }
];

const pubList = document.getElementById('pub-list');
const pubFilter = document.getElementById('pub-filter');
const pubCount = document.getElementById('pub-count');

function uniqueTags() {
  const set = new Set();
  PUBLICATIONS.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort();
}

function parseTagsFromUrl() {
  const params = new URLSearchParams(location.search);
  const tags = params.get('tags');
  return tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [];
}

function setTagsInUrl(tags) {
  const params = new URLSearchParams(location.search);
  if (tags.length) params.set('tags', tags.join(','));
  else params.delete('tags');
  history.replaceState(null, '', `${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`);
}

function renderFilters(activeTags) {
  pubFilter.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.setAttribute('aria-pressed', String(activeTags.length === 0));
  allBtn.addEventListener('click', () => {
    setTagsInUrl([]); renderFilters([]); renderPubs([]);
  });
  pubFilter.appendChild(allBtn);

  uniqueTags().forEach(tag => {
    const b = document.createElement('button');
    b.textContent = tag;
    b.setAttribute('aria-pressed', String(activeTags.includes(tag)));
    b.addEventListener('click', () => {
      const next = activeTags.includes(tag) ? activeTags.filter(t => t !== tag) : [...activeTags, tag];
      setTagsInUrl(next); renderFilters(next); renderPubs(next);
    });
    pubFilter.appendChild(b);
  });
}

function renderPubs(activeTags) {
  const items = !activeTags.length
    ? PUBLICATIONS
    : PUBLICATIONS.filter(p => (p.tags || []).every(t => activeTags.includes(t)));
  pubList.innerHTML = items.map(p => `
    <li>
      <strong><a href="${p.link || '#'}" target="_blank" rel="noopener">${p.title}</a></strong><br>
      <span>${p.authors}</span> — <em>${p.venue}</em> (${p.year})
    </li>
  `).join('');
  if (pubCount) pubCount.textContent = `${items.length} result${items.length === 1 ? '' : 's'}`;
}

// Initialize publications UI when its panel first becomes active
let pubsInitialized = false;
function initPublicationsIfNeeded() {
  if (pubsInitialized) return;
  pubsInitialized = true;
  const active = parseTagsFromUrl();
  renderFilters(active);
  renderPubs(active);
}

// Observe panel activation to lazily init pubs
const observer = new MutationObserver(() => {
  const pubsPanel = document.getElementById('panel-pubs');
  if (pubsPanel && pubsPanel.classList.contains('active')) initPublicationsIfNeeded();
});
observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

// If deep-linked to publications, initialize immediately
if ((location.hash || '').includes('pubs')) initPublicationsIfNeeded();
