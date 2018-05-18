import {LitElement, html} from '@polymer/lit-element';
import {Button} from '@material/mwc-button/mwc-button.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {pushLocationTo} from '../utils';
import {store} from '../store.js';

export default class Welcome extends connect(store)(LitElement) {
    static get properties() {
        return {
            displayName: String,
        };
    }

    _render({displayName}) {
        return html`
            <style>
                h1 {
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
                    margin-bottom: 20px;
                    padding: 10px 20px;
                    background-color: white;
                }

                #welcome {
                    margin-bottom: 20px;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;
                }
            </style>
            <div class="paper-container">
                <paper-material>
                    <div id="welcome">
                    <h1>Welcome${displayName ? ` ${displayName}.` : `.`}</h1>
                    <p>Select your Replus Device</p>
                    <mwc-button raised class="light" label="Replus Remote" on-click="${() =>
                        pushLocationTo(
                            '/dashboard/remote/rooms'
                        )}"></mwc-button>
                    <mwc-button raised class="light" label="Replus Vision" on-click="${() =>
                        pushLocationTo(
                            '/dashboard/vision/events'
                        )}"></mwc-button>
                    </div>
                </paper-material>
                <paper-material>
                        <mwc-button label="Help and Guides" on-click="${() =>
                            pushLocationTo('/dashboard/help')}"></mwc-button>
                        <mwc-button label="Support"></mwc-button>
                        <mwc-button label="Feedback"></mwc-button>
                </paper-material>
            </div>
    `;
    }

    _stateChanged(state) {
        const stateDisplayName = _.get(state, 'app.currentUser.displayName');
        this.displayName = stateDisplayName;
    }
}

customElements.define('main-welcome', Welcome);
