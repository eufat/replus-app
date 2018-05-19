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
            </style>
            <div class="paper-container">
                <paper-material>
                    <div class="help-navigation">
                        <mwc-button icon="chevron_left" label="Back to Welcome Screen" on-click="${() =>
                            pushLocationTo('/dashboard/welcome')}"></mwc-button>
                    </div>
                    <div class="help-container">
                    <h1>Help and Guides</h1>
                    <h3>1. Add Replus App to Homescreen</h3>
                    <section class="add-to-homescreen">
                        <div class="section-content">
                            <h4>for Android (Chrome)</h4>
                            <img class="add-to-homescreen-image" src="images/add-to-homescreen-android.png" />
                            <ol>
                                <li>Click the top vertical three dot icon</li>
                                <li>Find the "Add to Home screen" button</li>
                                <li>Press "Add to Home screen"</li>
                            </ol>
                        </div>
                        <div class="section-content">
                            <h4>for iOS (Safari)</h4>
                            <img class="add-to-homescreen-image" src="images/add-to-homescreen-ios.png" />
                            <ol>
                                <li>Click bottom share icon</li>
                                <li>Swipe to find the "Add to Home screen" button</li>
                                <li>Press "Add to Home screen"</li>
                            </ol>
                        </div>
                    </section>
                    </div>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-help', Help);
