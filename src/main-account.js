import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class MainAccount extends PolymerElement {
    static get template() {
        return html`
      <div>Main Account</div>
    `;
    }
}

customElements.define('main-account', MainAccount);
