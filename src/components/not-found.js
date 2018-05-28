import {LitElement, html} from '@polymer/lit-element';

export default class NotFound extends LitElement {
    _render() {
        return html`
            <center>
                <h1>404 Not Found</h1>
                <p>The page you looking for is not found.</p>
            </center>
    `;
    }
}

customElements.define('not-found', NotFound);
