import {LitElement, html} from '@polymer/lit-element';

export default class MainMetrics extends LitElement {
    _render() {
        return html`
            <style>
                .container {
                    margin: 0 auto;
                    max-width: 960px;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                    line-height: 80vh;
                }
            </style>
            <div class="container">
                <div class="center-vh">
                    <p>Your metrics is empty.<p>
                </div>
            </div>
    `;
    }
}

customElements.define('main-metrics', MainMetrics);
