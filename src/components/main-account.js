import {LitElement, html} from '@polymer/lit-element';

export default class MainAccount extends LitElement {
    _render() {
        return html`
      <div>Main Account</div>
    `;
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    static get properties() {
        return {
            active: Boolean,
        };
    }
}

customElements.define('main-account', MainAccount);
