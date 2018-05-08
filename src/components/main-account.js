import {
    PolymerElement,
    html
} from "/node_modules/@polymer/polymer/polymer-element.js";

export default class MainAccount extends PolymerElement {
    static get template() {
        return html`
      <div>Main Account</div>
    `;
    }
}

customElements.define("main-account", MainAccount);
