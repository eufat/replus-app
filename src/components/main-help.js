import {LitElement, html} from '@polymer/lit-element';
import {Button} from '@material/mwc-button/mwc-button.js';
import {pushLocationTo} from '../utils';

export default class Help extends LitElement {
    static get properties() {
        return {
            displayName: String,
        };
    }

    _render({displayName}) {
        return html`
            <style>
                h1, h3 {
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
                    padding: 10px 20px;
                    background-color: white;
                }

                img.add-to-homescreen {
                    width: 300px;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;
                }
            </style>
            <div class="paper-container">
                <paper-material>
                    <mwc-button icon="chevron_left" label="Back to Welcome Screen" on-click="${() =>
                        pushLocationTo('/dashboard/welcome')}"></mwc-button>
                </paper-material>
                <paper-material>
                    <h1>Help and Guides</h1>
                    <h3>1. Add Replus App to Android (Chrome)</h3>
                    <img class="add-to-homescreen" src="images/add-to-homescreen-android.png" />
                    <ol>
                        <li>Click the top vertical three dot icon</li>
                        <li>Find the "Add to Home screen" button</li>
                        <li>Press "Add to Home screen"</li>
                    </ol>
                    <h3>2. Add Replus App for iOS (Safari)</h3>
                    <img class="add-to-homescreen" src="images/add-to-homescreen-ios.png" />
                    <ol>
                        <li>Click bottom share icon</li>
                        <li>Swipe to find the "Add to Home screen" button</li>
                        <li>Press "Add to Home screen"</li>
                    </ol>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-help', Help);
