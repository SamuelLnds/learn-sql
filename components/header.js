/**
 * Gère les clics dans la barre de navigation et le surlignage du bouton actif.
 */
class NavigationManager {
  /**
   * @param {Object} options
   * @param {Function} options.showExercise — fonction globale exposée
   * @param {string}   options.navbarSelector — sélecteur du <ul>
   * @param {string}   options.activeClass — classe CSS à appliquer
   */
  constructor({ showExercise, navbarSelector = '#navbar', activeClass = 'active' }) {
    this.showExercise = showExercise;
    this.navbar       = document.querySelector(navbarSelector);
    this.activeClass  = activeClass;
  }

  init() {
    if (!this.navbar) return;

    const BASE = '/learn-sql/';
    this.navbar.addEventListener('click', e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;
      const exId = btn.dataset.id; // "ex1", "ex2", ...
    
      // Si on n'est pas sur la page d'exos (chemin != "/learn-sql/" ou "/learn-sql/index.html")
      const p = location.pathname;
      const isOnIndex = (p === BASE || p === BASE + 'index.html');
      if (!isOnIndex) {
        // redirige vers la racine des exos avec ?id=1
        window.location.href = `/learn-sql/?id=${exId.replace('ex','')}`;
        return;
      }
    
      // Sinon, on est bien sur la page d'exos :
      this.showExercise(exId);
      this._highlightButton(btn);
    });

    // Si ?id= dans l’URL au chargement, on surligne déjà
    const idParam = new URLSearchParams(location.search).get('id');
    if (idParam) {
      const btn = this.navbar.querySelector(`button[data-id="ex${idParam}"]`);
      if (btn) this._highlightButton(btn);
    }
  }

  _highlightButton(btn) {
    this.navbar.querySelectorAll('button[data-id]')
      .forEach(b => b.classList.toggle(this.activeClass, b === btn));
  }
}

/**
 * Composant personnalisé <my-header> :
 * injecte le HTML du header et lance la nav.
 */
class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav>
          <ul id="navbar">
            <li><button data-id="ex1">Exercice 1</button></li>
            <li><button data-id="ex2">Exercice 2</button></li>
            <li><button data-id="ex3">Exercice 3</button></li>
            <li><button data-id="ex4">Exercice 4</button></li>
            <li><button data-id="ex5">Exercice 5</button></li>
            <li><button data-id="ex6">Exercice 6</button></li>
          </ul>
        </nav>
      </header>
    `;

    new NavigationManager({
      showExercise: window.showExercise,
      navbarSelector: '#navbar',
      activeClass: 'active'
    }).init();
  }
}

customElements.define('my-header', MyHeader);