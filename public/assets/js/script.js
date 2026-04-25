import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const extraCommands = document.getElementById('extra-commands');
  const mainGrid = document.getElementById('main-grid');
  const loader = document.getElementById('loader');

  // Function to set staggered delays for cards by rows
  const setStagger = (container, baseDelay = 0) => {
    const cards = Array.from(container.querySelectorAll('.command-card'));
    if (cards.length === 0) return;

    // Group by row using offsetTop
    const rows = {};
    cards.forEach(card => {
      const top = card.offsetTop;
      if (!rows[top]) rows[top] = [];
      rows[top].push(card);
    });

    const sortedTops = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

    sortedTops.forEach((top, rowIndex) => {
      rows[top].forEach(card => {
        card.style.animationDelay = `${baseDelay + (rowIndex * 0.08)}s`;
      });
    });
  };

  const createCard = (cmd) => {
    const div = document.createElement('div');
    div.className = 'command-card';
    div.innerHTML = `
      <div class="cmd-header">
        <span class="cmd-name">${cmd.name}</span>
        ${cmd.args ? `<span class="cmd-args">${cmd.args}</span>` : ''}
      </div>
      <div class="cmd-desc">${cmd.description}</div>
    `;
    return div;
  };

  // Real-time listener for commands from Firebase
  const q = query(collection(db, "commands"), orderBy("order", "asc"));
  
  onSnapshot(q, (snapshot) => {
    mainGrid.innerHTML = '';
    extraCommands.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const cmd = doc.data();
      const card = createCard(cmd);
      if (cmd.category === 'main') {
        mainGrid.appendChild(card);
      } else {
        extraCommands.appendChild(card);
      }
    });

    // Hide loader once data arrives
    if (loader) loader.style.display = 'none';
    
    // Apply staggered animation after a tiny delay to ensure DOM is ready
    setTimeout(() => {
      setStagger(mainGrid);
    }, 50);
  });

  if (toggleBtn && extraCommands) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = extraCommands.classList.toggle('hidden');
      
      if (isHidden) {
        extraCommands.classList.remove('revealed');
        toggleBtn.textContent = 'Gamble away your points';
      } else {
        // Recalculate stagger for the hidden section when revealed
        setStagger(extraCommands);
        extraCommands.classList.add('revealed');
        toggleBtn.textContent = 'Hide';
      }
    });
  }
});
