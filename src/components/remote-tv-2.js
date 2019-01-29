// import {PolymerElement, html} from '@polymer/polymer';
import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import get from 'lodash/get';

import '@polymer/paper-fab';
import '@polymer/paper-toast';
import '@polymer/paper-button';
import '@polymer/paper-icon-button';
import '@polymer/paper-material';
import '@polymer/paper-material/paper-material-shared-styles';
import '@polymer/paper-dialog';
import '@polymer/paper-styles/paper-styles';
import '@polymer/paper-styles/paper-styles-classes';
import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/iron-icons/communication-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';

import {remoteCommand} from '../actions/remote.js';
import {toTitleCase} from '../utils.js';
import {store} from '../store.js';

export default class RemoteTv extends connect(store)(LitElement) {
    static get properties() {
        return {
            command: String,
            codeset: String,
            rooms: Array,
            remoteTitle: String,
            backable: {
                type: Boolean,
                observer: '_tapBack',
            },
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.remoteTitle = 'Remote TV';
        this.backable = false;
    }

    _didRender() {
        if (this.backable == false) {
            this.stateInitial();
        }
    }

    _firstRendered() {
        this.setupPosition();
        this.stateInitial();
        window.addEventListener('resize', () => {
            this.setupPosition();
        });
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.activeRemote = get(state, 'remote.activeRemote');
        this.backable = get(state, 'app.backable');
    }

    // ready() { // PolymerElement
    //     super.ready();
    //     this.setupPosition();
    //     this.stateInitial();
    //     window.addEventListener('resize', () => {
    //         this.setupPosition();
    //     });
    //     // this.setRemoteCodeSet();
    // }

    setupPosition() {
        const menubuttons = this.shadowRoot.getElementById('menubuttons');
        const remoteContainer = this.shadowRoot.getElementById('remoteContainer');
        if (window.innerHeight > 570) menubuttons.style.marginTop = window.innerHeight - 550 - 90 + 'px';
        else menubuttons.style.marginTop = '20px';

        if (window.innerWidth > 375) {
            remoteContainer.style.width = '350px';
            remoteContainer.style.marginLeft = (window.innerWidth - 350) / 2 + 'px';
        } else {
            remoteContainer.style.width = '300px';
            remoteContainer.style.marginLeft = (window.innerWidth - 300) / 2 + 'px';
            if (window.innerWidth < 325) {
                remoteContainer.style.width = '250px';
                remoteContainer.style.marginLeft = (window.innerWidth - 250) / 2 + 'px';
            }
        }
    }

    stateInitial() {
        const title = this.shadowRoot.getElementById('title');
        const btnPower = this.shadowRoot.getElementById('btnPower');
        title.style.visibility = 'hidden';
        btnPower.setAttribute('icon', 'power-settings-new');
        this.switchOn = false;
    }

    stateEnable() {
        const title = this.shadowRoot.getElementById('title');
        const btnPower = this.shadowRoot.getElementById('btnPower');
        title.style.visibility = 'visible';
        btnPower.setAttribute('icon', 'close');
        this.switchOn = true;
    }

    setRemoteCodeSet() {
        const remoteType = this.activeRemote.name.substring(0, 2);
        const brand = this.activeRemote.name.substring(3).toLowerCase();
        if (remoteType == 'tv') {
            if (brand == 'lg') this.codeset = '1970';
            else if (brand == 'samsung') this.codeset = '0595';
            else if (brand == 'panasonic') this.codeset = '2619';
            else if (brand == 'sony') this.codeset = '1319';
            else if (brand == 'sharp') this.codeset = 'T001';
            else if (brand == 'changhong') this.codeset = '2903';
            else if (brand == 'sanyo') this.codeset = '1430';
            else if (brand == 'toshiba') this.codeset = '0339';
        }
    }

    _tapBtn(e) {
        this.setRemoteCodeSet();
        const remoteType = this.activeRemote.name.substring(0, 2).toUpperCase();
        const brand = toTitleCase(this.activeRemote.name.substring(2, this.activeRemote.name.length));
        this.remoteTitle = remoteType + ' ' + brand;

        let command = e.path[2].getAttribute('data-command');
        if (command == null) {
            command = e.target.title;
            if (command == '') {
                // this.$.toast.show({text: 'Please try another button.', duration: 1000});
                return;
            }
        } else if (command == '15') {
            if (this.switchOn) {
                this.stateInitial();
                command = '16';
            } else {
                this.stateEnable();
            }
        }
        this.command = this.codeset + '' + command;
        store.dispatch(remoteCommand(this.command));
    }

    _tapBack() {
        const btnPower = this.shadowRoot.getElementById('btnPower');
        if (this.backable == true) {
            btnPower.setAttribute('icon', 'power-settings-new');
            this.stateInitial();
        }
    }

    _closedDialog() {
        const btnNumpad = this.shadowRoot.getElementById('btnNumpad');
        btnNumpad.removeAttribute('disabled');
    }

    _showDialog() {
        const dialog = this.shadowRoot.getElementById('dialog');
        const btnNumpad = this.shadowRoot.getElementById('btnNumpad');
        dialog.open();
        btnNumpad.setAttribute('disabled', 'true');
    }

    // _handleResponse() {
    //     let response = this.response;
    //     if (response == 'OK') {
    //         console.log(`Sending command ${this.command}: ${this.response}`);
    //     } else if (response == 'NO_DEVICE') {
    //         this.$.toast.show({text: 'No device is assigned for this room.', duration: 3000});
    //     } else if (response == 'NO_RESPONSE') {
    //         thisRemoteAC.$.toast.show({text: 'Device is offline.', duration: 1000});
    //     } else {
    //         this.$.toast.show({text: 'Unknown error.', duration: 1000});
    //     }
    // }

    _render({command, codeset, rooms, remoteTitle, backable}) {
        return html`
            <style is="custom-style" include="iron-flex iron-flex-alignment">
                :host {
                    --iron-icon-height: 50px;
                    --iron-icon-width: 50px;

                    --paper-icon-button: {
                        color: #2B5788;
                        height: 60px;
                        width: 60px;
                    };
                }

                p {
                    color: #2B5788;
                }

                paper-dialog paper-button {
                    --paper-button: {
                        background: #f7f7f7;
                        color: #2B5788;
                        font-weight: 500;
                        margin-bottom: 0px;
                        width: 100px;
                    };
                }

                paper-dialog {
                    bottom: 0;
                }

                paper-fab {
                    margin-bottom: 20px;
                    color: #2B5788;
                    --paper-fab-background: white;
                    --paper-fab-keyboard-focus-background: white;
                }

                #btnPower {
                    color: #c0392b;
                }

                #menubuttons {
                    margin-top: 1rem !important;
                    background-color: white;
                    padding: 5px;
                }

                #menubuttons paper-button {
                    --paper-button: {
                        color: #2B5788;
                        font-weight: 500;
                        margin: 0;
                        padding: 0;
                    };
                }

                #remoteContainer {
                    width: 330px;
                    margin-left: 209px;
                    /* margin: 30px auto; */
                }

                .title-header {
                    margin-top: 10px;
                    margin-bottom: 10px;
                }

                .shadow-2dp {
                    @apply --shadow-elevation-2dp;
                }
                /*@media (min-width: 640px) {
                    #toast {
                        margin-left: 268px;
                    }
                }*/

                /* Style Refactor */
                .container {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 0 0.8rem 5rem;
                }
                .center-justified {
                    display: flex;
                    justify-content: center;
                }
                .center-around {
                    display: flex;
                    justify-content: space-around;
                }
                .justified {
                    display: flex;
                    justify-content: space-between;
                }
            </style>
            <div id="remoteContainer">
                <div class="title-header">
                    <div id="title" class="horizontal layout center-justified">
                        <p>${remoteTitle}</p>
                    </div>
                </div>

                <div class="horizontal layout justified">
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="15" icon="power-settings-new" id="btnPower"></paper-fab>
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="17" icon="input"></paper-fab>
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="10" icon="av:volume-off"></paper-fab>
                </div>

                <div class="horizontal layout justified">
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="13" icon="av:volume-up"></paper-fab>
                    <paper-fab on-tap="${() => this._showDialog()}" icon="communication:dialpad" id="btnNumpad" style="top: 45px;"></paper-fab>
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="11" icon="hardware:keyboard-arrow-up"></paper-fab>
                </div>

                <div class="horizontal layout justified">
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="14" icon="av:volume-down"></paper-fab>
                    <paper-fab on-tap="${(e) => this._tapBtn(e)}" data-command="12" icon="hardware:keyboard-arrow-down"></paper-fab>
                </div>
                <div id="menubuttons" class="shadow shadow-2dp">
                    <div class="horizontal layout center-around">
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="18">Menu</paper-button>
                        <paper-icon-button on-tap="${(e) => this._tapBtn(e)}" data-command="21" icon="hardware:keyboard-arrow-up"></paper-icon-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="19">Return</paper-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-icon-button on-tap="${(e) => this._tapBtn(e)}" data-command="23" icon="hardware:keyboard-arrow-left"></paper-icon-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="20">OK</paper-button>
                        <paper-icon-button on-tap="${(e) => this._tapBtn(e)}" data-command="24" icon="hardware:keyboard-arrow-right"></paper-icon-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-icon-button on-tap="${(e) => this._tapBtn(e)}" data-command="22" icon="hardware:keyboard-arrow-down"></paper-icon-button>
                    </div>
                </div>

                <paper-dialog id="dialog" on-iron-overlay-closed="${() => this._closedDialog()}" with-backdrop>
                    <div class="horizontal layout center-justified">
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="01">1</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="02">2</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="03">3</paper-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="04">4</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="05">5</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="06">6</paper-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="07">7</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="08">8</paper-button>
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="09">9</paper-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-button on-tap="${(e) => this._tapBtn(e)}" title="00">0</paper-button>
                    </div>
                </paper-dialog>
            </div>

            <paper-toast id="toast"></paper-toast>
        `;
    }
}

window.customElements.define('remote-tv', RemoteTv);
