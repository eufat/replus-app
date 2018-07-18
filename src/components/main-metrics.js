import {LitElement, html} from '@polymer/lit-element';

export default class MainMetrics extends LitElement {
    _render() {
        return html`
            <center>
                <p>Metrics page.</p>
            </center>
    `;
    }
}

customElements.define('main-metrics', MainMetrics);
