// Réordonnancement des champs par glisser-déposer (vanilla JS).
(function () {
  const list = document.getElementById('field-list');
  if (!list) return;
  const status = document.getElementById('order-status');
  let dragged = null;

  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('.field-row');
    if (!li) return;
    dragged = li;
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    if (dragged) dragged.classList.remove('dragging');
    dragged = null;
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragged) return;
    const after = getAfterElement(list, e.clientY);
    if (after == null) list.appendChild(dragged);
    else list.insertBefore(dragged, after);
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    saveOrder();
  });

  function getAfterElement(container, y) {
    const items = [...container.querySelectorAll('.field-row:not(.dragging)')];
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  async function saveOrder() {
    const ids = [...list.querySelectorAll('.field-row')].map((li) => li.dataset.id);
    if (status) status.textContent = 'Enregistrement…';
    try {
      const res = await fetch('/admin/formulaire/ordre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      const data = await res.json();
      if (status) status.textContent = data.ok ? 'Ordre enregistré ✓' : "Échec de l'enregistrement";
    } catch {
      if (status) status.textContent = "Échec de l'enregistrement";
    }
  }
})();