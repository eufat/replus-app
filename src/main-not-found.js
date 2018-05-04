import {PolymerElement, html} from '@polymer/polymer/polymer-element';

export default class NotFound extends PolymerElement {
    static get template() {
        return html`
            <center>
                <h1>404 Not Found</h1>
                <p>The page you looking for is not found.</p>
            </center>
    `;
    }
}

customElements.define('main-not-found', NotFound);
