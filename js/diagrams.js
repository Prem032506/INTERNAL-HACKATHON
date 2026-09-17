/**
 * Interactive Block Diagram & Flowchart Controller
 */

function switchDiagramTab(tabId) {
  document.querySelectorAll('.diagram-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.diagram-view').forEach(v => v.classList.remove('active'));

  const activeTab = document.querySelector(`.diagram-tab[data-tab="${tabId}"]`);
  const activeView = document.getElementById(tabId);

  if (activeTab) activeTab.classList.add('active');
  if (activeView) activeView.classList.add('active');
}

function showNodeDetail(title, desc, tech) {
  const panel = document.getElementById('node-detail-panel');
  const titleEl = document.getElementById('detail-title');
  const descEl = document.getElementById('detail-desc');
  const techEl = document.getElementById('detail-tech');

  if (panel && titleEl && descEl && techEl) {
    titleEl.textContent = title;
    descEl.innerHTML = desc;
    techEl.textContent = tech || 'Architecture Component';
    panel.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.diagram-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchDiagramTab(tabId);
    });
  });
});
