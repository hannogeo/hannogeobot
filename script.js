document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const extraCommands = document.getElementById('extra-commands');

  // Function to set staggered delays for cards by rows
  const setStagger = (selector, baseDelay = 0) => {
    const cards = Array.from(document.querySelectorAll(selector));
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

  // Initialize main grid stagger on load
  setStagger('main .command-card');

  if (toggleBtn && extraCommands) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = extraCommands.classList.toggle('hidden');
      
      if (isHidden) {
        extraCommands.classList.remove('revealed');
        toggleBtn.textContent = 'Gamble away your points';
      } else {
        // Set stagger first, then reveal
        setStagger('#extra-commands .command-card');
        extraCommands.classList.add('revealed');
        toggleBtn.textContent = 'Hide';
      }
    });
  }
});
