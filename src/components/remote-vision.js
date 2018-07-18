import {LitElement, html} from '@polymer/lit-element';

export default class remoteVision extends LitElement {
    _render() {
        return html`
            <center>
                <h1>Vision Page</h1>
                <p>The page you looking for for vision.</p>
            </center>
    `;
    }
}

customElements.define('remote-vision', remoteVision);
