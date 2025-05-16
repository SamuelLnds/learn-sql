class MyFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer style="text-align:center; padding:1rem; border-top:1px solid var(--border); color:var(--text)">
          <a href="./ressources/" style="color: var(--accent); text-decoration: none;">📚 Voir les ressources SQL</a>
        </footer>
      `;
    }
  }
  
customElements.define('my-footer', MyFooter);  