import {LitElement, html} from '@polymer/lit-element';
import {Button} from '@material/mwc-button/mwc-button.js';
import {pushLocationTo} from '../utils';

export default class Help extends LitElement {
    static get properties() {
        return {
            displayName: String,
            active: Boolean
        };
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _render({displayName}) {
        return html`
            <style>
                h3, h2, h3, h4, h5, h6 {
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
                    margin: 20px;
                    padding: 10px 20px;
                    background-color: white;
                }

                .help-container {
                    padding: 0 20px 20px;

                }

                section {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }

                .section-content {
                    margin-right: 10px;
                }

                img.add-to-homescreen-image {
                    width: 300px;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;
                }

                a {
                    text-decoration: none;
                }
            </style>
            <div class="paper-container">
                <paper-material>
                    <h3>Help</h3>
                    <section>
                        <div class="section-content">
                            <h4>1. Add Replus App to homescreen for Android (Chrome)</h4>
                            <img class="add-to-homescreen-image" src="images/add-to-homescreen-android.png" />
                            <ol>
                                <li>Click the top vertical three dot icon</li>
                                <li>Find the "Add to Home screen" button</li>
                                <li>Press "Add to Home screen"</li>
                            </ol>
                        </div>
                        <div class="section-content">
                            <h4>2. Add Replus App to homescreen for iOS (Safari)</h4>
                            <img class="add-to-homescreen-image" src="images/add-to-homescreen-ios.png" />
                            <ol>
                                <li>Click bottom share icon</li>
                                <li>Swipe to find the "Add to Home screen" button</li>
                                <li>Press "Add to Home screen"</li>
                            </ol>
                        </div>
                    </section>
                </paper-material>
                <paper-material>
                    <h3>Support</h3>
                    <section>
                        <div class="section-content">
                            <p>Contact Us</p>
                            <p>
                                <a href="mail:hello@replus.co">hello@replus.co</a>
                                <br />
                                <a href="tel:+62087889620709">(62) 087889620709</a>
                                <br />
                                <p>PT POCI Otomasi Cerdas Indonesia</p>
                                <br /> Ruang Tenant Gedung ILRC Lantai 2
                                <br /> Universitas Indonesia, Depok, Jawa Barat
                            </p>
                        </div>
                    </section>
                </paper-material>
                <paper-material>
                    <h3>Feedback</h3>
                    <section>
                        <div class="section-content">
                            <mwc-button raised icon="feedback" class="light" label="Fill Feedback Form"></mwc-button>
                        </div>
                    </section>
                </paper-material>
            </div>
    `;
    }
}

customElements.define('main-help', Help);
