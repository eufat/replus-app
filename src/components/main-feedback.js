import {LitElement, html} from '@polymer/lit-element';
import {Button} from '@material/mwc-button/mwc-button.js';
import {pushLocationTo} from '../utils';

export default class Feedback extends LitElement {
    static get properties() {
        return {
            displayName: String,
        };
    }

    _render({displayName}) {
        return html`
            <style>
                h1, h2, h3, h4, h5, h6 {
                    font-weight: normal;
                }

                .light {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }

                paper-material {
                    display: block;
                    padding: 10px 0;
                    background-color: white;
                }

                .help-container {
                    padding: 0 20px 20px;

                }

                .help-navigation {
                    padding: 10px 20px;
                    border-bottom: 1px solid #ccc;
                }

                section {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }

                .section-content {

                }

                img.add-to-homescreen-image {
                    width: 300px;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;
                }

                .light {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }
            </style>
            <div class="paper-container">
                <paper-material>
                    <div class="help-navigation">
                        <mwc-button icon="chevron_left" label="Back to Welcome Screen" on-click="${() =>
                            pushLocationTo('/dashboard/welcome')}"></mwc-button>
                    </div>
                    <div class="help-container">
                    <h1>Feedback</h1>
                    <section>
                        <div class="section-content">
                            <mwc-button raised icon="feedback" class="light" label="Fill Feedback Form"></mwc-button>
                        </div>
                    </section>
                    </div>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-feedback', Feedback);
