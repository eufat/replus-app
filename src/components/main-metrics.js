import {LitElement, html} from '@polymer/lit-element';

export default class MainMetrics extends LitElement {
    _render() {
        return html`
            <style>
                .container {
                    margin: 0 auto;
                    max-width: 680px;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                }

                .center-vh p {
                    position: relative;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .center-vh iron-icon {
                    margin-bottom: 1rem;
                    --iron-icon-fill-color: #5f6368;
                    --iron-icon-height: 48px;
                    --iron-icon-width: 48px;
                }
            </style>
            <div class="container">
                <div class="center-vh">
                    <p>
                        <iron-icon icon="icons:timeline"></iron-icon><br />
                        No metrics found
                    </p>
                </div>
            </div>
    `;
    }
}

customElements.define('main-metrics', MainMetrics);
