import {LitElement, html} from '@polymer/lit-element';
import '@polymer/paper-toast/paper-toast.js';

class SnackBar extends LitElement {
    _render({text, active}) {
        return html`
          <paper-toast text="${text}" opened?="${active}" verticalOffset="${60}"></paper-toast>
    `;
    }

    static get properties() {
        return {
            text: String,
            active: Boolean,
        };
    }
}

window.customElements.define('snack-bar', SnackBar);
