/* ----------------------------- Router ----------------------------- */
class Router {
  static updateQueryParam(id) {
    const value = id.replace('ex', '');
    history.replaceState(null, '', `?id=${value}`);
  }

  static redirectToIndexIfNeeded(id) {
    const path = location.pathname;
    const onIndex = path.endsWith('/') || path.endsWith('/index.html');
    if (!onIndex) {
      window.location.href = `./?id=${id.replace('ex', '')}`;
      return true;
    }
    return false;
  }
}

/* ------------------------- ExerciseManager ------------------------- */
class ExerciseManager {
  constructor(selector = '.exercise') {
    this.sections = document.querySelectorAll(selector);
  }

  resetAll() {
    this.sections.forEach(section => {
      section.classList.remove('visible');
      section.querySelectorAll('.correction')
             .forEach(c => c.classList.add('hidden'));
      section.querySelectorAll('.toggle-btn')
             .forEach(btn => btn.textContent = 'Afficher la correction');
    });
  }

  show(id) {
    if (Router.redirectToIndexIfNeeded(id)) return;
    this.resetAll();
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('visible');
      Router.updateQueryParam(id);
    }
  }
}

/* ----------------------- CorrectionManager ------------------------ */
class CorrectionManager {
  static toggle(button) {
    const corr = button.nextElementSibling;
    const hidden = corr.classList.toggle('hidden');
    button.textContent = hidden ? 'Afficher la correction' : 'Masquer la correction';
  }

  static bindAll(selector = '.toggle-btn') {
    document.querySelectorAll(selector).forEach(btn =>
      btn.addEventListener('click', () => CorrectionManager.toggle(btn))
    );
  }
}

/* -------------------------- TOCGenerator -------------------------- */
class TOCGenerator {
  constructor(tocSelector = '#toc-list', contentSelector = 'main > section') {
    this.tocList = document.getElementById(tocSelector.replace('#',''));
    this.headers = document.querySelectorAll(`${contentSelector} article > h3`);
  }

  static slugify(text) {
    return text.toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  build() {
    this.headers.forEach(h3 => {
      if (!h3.id) h3.id = TOCGenerator.slugify(h3.textContent);
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href = `ressources/#${h3.id}`;
      a.textContent = h3.textContent.replace(/<\/?code>/g, '');
      li.appendChild(a);
      this.tocList.appendChild(li);
    });
  }
}

/* ----------------------- TOCHighlighter ----------------------- */
/**
 * Met en surbrillance le lien TOC correspondant à la section visible
 * et fait défiler le conteneur #toc-list si nécessaire.
 */
class TOCHighlighter {
  /**
   * @param {string} linkSelector — sélecteur des liens du TOC
   * @param {string} targetSelector — sélecteur des titres ciblés (doivent avoir un id)
   */
  constructor(linkSelector = '#toc-list a', targetSelector = 'main h3[id]') {
    this.linkSelector   = linkSelector;
    this.targetSelector = targetSelector;
    this.observer = new IntersectionObserver(
      this._onIntersect.bind(this),
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
  }

  /**
   * Lance l’observation sur chaque titre.
   * Doit être appelé **après** la génération du TOC.
   */
  observe() {
    // On récupère les liens UNE SEULE FOIS, maintenant qu'ils existent
    this.links = document.querySelectorAll(this.linkSelector);
    this.targets = document.querySelectorAll(this.targetSelector);

    this.targets.forEach(el => this.observer.observe(el));
  }

  /**
   * Callback IntersectionObserver : surligne le lien et scroll le TOC si besoin.
   * @param {IntersectionObserverEntry[]} entries
   */
  _onIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const hash = `./#${entry.target.id}`;
      this.links.forEach(link => {
        const isActive = (link.hash === hash);
        link.classList.toggle('active', isActive);
        if (isActive) {
          // Scroll le lien actif dans le conteneur #toc
          link.scrollIntoView({ block: 'nearest' });
        }
      });
    });
  }
}

/* ------------------------- Globals & Init ------------------------ */
// instance globale
const exManager = new ExerciseManager();

/**
 * Fonction globale pour la navigation.
 * @param {string} id — ex: "ex1"
 */
function showExercise(id) {
  exManager.show(id);
}

window.showExercise = showExercise;

document.addEventListener('DOMContentLoaded', () => {
  // Génère le TOC
  const tocGen  = new TOCGenerator();
  tocGen.build();

  // Highlight au clic
  const tocLinks = document.querySelectorAll('#toc-list a');
  tocLinks.forEach(link => {
    link.addEventListener('click', () => {
      tocLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Observe les titres
  const tocHigh = new TOCHighlighter();
  tocHigh.observe();

  // Les corrections
  CorrectionManager.bindAll();

  // Reste de l’init (exercice par défaut)
  const idParam = new URLSearchParams(location.search).get('id');
  if (idParam) exManager.show(`ex${idParam}`);

  // Référence
  const toc       = document.getElementById('toc');
  const toggleBtn = document.getElementById('toc-toggle');

  if (toggleBtn && toc) {
    // Au clic, bascule la classe 'open' sur #toc
    toggleBtn.addEventListener('click', () => {
      const isOpen = toc.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }
});