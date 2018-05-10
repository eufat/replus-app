import {LitElement, html} from '@polymer/lit-element';

export default class MainAccount extends LitElement {
    _render() {
        return html`
      <div>Main Account</div>
    `;
    }
}

customElements.define('main-account', MainAccount);
