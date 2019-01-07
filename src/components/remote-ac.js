import {PolymerElement, html} from '@polymer/polymer';
import {connect} from 'pwa-helpers/connect-mixin';

import get from 'lodash/get';
import values from 'lodash/values';

import '@polymer/paper-fab';
import '@polymer/paper-toast';
import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';

import {remoteCommand} from '../actions/remote.js';
import {toTitleCase, fansAC, modesAC} from '../utils.js';
import {store} from '../store.js';

class RemoteAc extends connect(store)(PolymerElement) {
    static get template() {
        return html`
            <style include="iron-flex iron-flex-alignment">
                :host {
                    --iron-icon-height: 50px;
                    --iron-icon-width: 50px;
                }

                p {
                    color: #2B5788;
                }

                paper-button {
                    background: #2B5788;
                    color: white;
                    margin-bottom: 10px;
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

                #displayContainer {
                    margin-left: 0px;       /*35*/
                    margin-right: 0px;      /*35*/
                    /*max-width: 400px;*/
                }

                #displayFan, #displayMode {
                    font-size: 25px;
                    margin: 0;
                    margin-top: -25px;
                }

                #displayTemp {
                    font-size: 70px;
                    margin: 0;
                }

                #displayTemp sup {
                    font-size: 30px;
                }

                #displayTemp sup sup {
                    font-size: 20px;
                }

                #mainContainer {
                    width: 330px;
                    margin-left: auto;
                    margin-right: auto;
                }

                #remoteContainer {
                    margin-top: 188px;
                    margin-bottom: 0px;
                }

                #textTemp {
                    margin-top: 25px;
                }
            </style>
            <div id="mainContainer">
                <div id="displayContainer">
                    <div class="horizontal layout center-justified">
                        <p>{{title}}</p>
                    </div>
                    <div class="horizontal layout center-justified">
                        <p id="displayTemp">{{temp}}<sup><sup>o</sup>C</sup></p>
                    </div>
                    <div class="horizontal layout justified">
                        <p id="displayMode">{{modeName}}</p>
                        <p id="displayFan">{{fanName}}</p>
                    </div>
                </div>
                <div id="remoteContainer">
                    <div class="horizontal layout center-justified">
                        <paper-fab on-tap="_tapPower" icon="power-settings-new" id="btnPower"></paper-fab>
                    </div>
                    <div class="horizontal layout justified">
                        <paper-fab disabled id="btnMode" on-tap="_tapMode" icon="menu"></paper-fab>
                        <p id="textTemp">Mode - Fan</p>
                        <paper-fab disabled id="btnFan" on-tap="_tapFan" icon="hardware:toys"></paper-fab>
                    </div>
                    <div class="horizontal layout justified">
                        <paper-fab disabled id="btnTempDown" on-tap="_tapDown" icon="remove"></paper-fab>
                        <p id="textTemp">Temperature</p>
                        <paper-fab disabled id="btnTempUp" on-tap="_tapUp" icon="add"></paper-fab>
                    </div>
                </div>
            </div>

            <paper-toast id="toast"></paper-toast>
        `;
    }

    static get properties() {
        return {
            fans: {
                type: Array,
                value: fansAC,
            },
            modes: {
                type: Array,
                value: modesAC,
            },
            mode: Number,
            fan: Number,

            manifest: Object,
            manifestModes: Array,
            manifestFans: Array,
            manifestTemps: Array,

            tempIndex: {type: Number, value: 0},
            fanIndex: {type: Number, value: 0},
            modeIndex: {type: Number, value: 0},

            modeName: String,
            fanName: String,

            activeRemote: Object,
            rooms: Array,
            title: String,
            brand: String,
            command: String,

            backable: {
                type: Boolean,
                observer: '_tapBack',
            },
        };
    }

    static get observers() {
        return ['resetTimeout(mode, fan, temp)'];
    }

    constructor() {
        super();
        this.rooms = [];
        this.title = '';
        this.manifest = {};
        this.activeRemote = {};
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.activeRemote = get(state, 'remote.activeRemote');
        this.manifest = get(state, 'remote.manifest');
        this.backable = get(state, 'app.backable');
    }

    ready() {
        super.ready();
        this.setupPosition();
        this.stateInitial();
        window.addEventListener('resize', () => {
            this.setupPosition();
        });
    }

    resetTimeout() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.send();
        }, 1000);
    }

    setupPosition() {
        if (window.innerHeight > 470) this.$.remoteContainer.style.marginTop = window.innerHeight - (64 + 70 + 120 + 270) + 'px';
        else this.$.remoteContainer.style.marginTop = '10px';

        if (window.innerWidth > 350) {
            this.$.mainContainer.style.width = '330px';
            this.$.mainContainer.style.marginLeft = (window.innerWidth - 330) / 2 + 'px';
            // if (window.innerWidth > 640) {
            //     this.$.mainContainer.style.marginLeft = ((window.innerWidth - 330)/2 - 128) + 'px';
            // }
        } else {
            this.$.mainContainer.style.width = '250px';
            this.$.mainContainer.style.marginLeft = (window.innerWidth - 250) / 2 + 'px';
        }
    }

    stateInitial() {
        this.switchedON = false;
        this.$.displayContainer.style.visibility = 'hidden';
        this.$.btnPower.setAttribute('icon', 'power-settings-new');
        this.$.btnMode.disabled = 'true';
        this.$.btnFan.disabled = 'true';
        this.$.btnTempUp.disabled = 'true';
        this.$.btnTempDown.disabled = 'true';
    }

    _tapBack() {
        if (this.backable == true) {
            this.stateInitial();
        }
        // this._tapPowerOFF();
    }

    getMode() {
        const arrModes = [];
        const manifestValues = values(this.manifest);
        manifestValues.map((item, index) => {
            const key = parseInt(Object.keys(this.manifest)[index]);
            arrModes.push(key);
        });
        this.manifestModes = arrModes;
        this.mode = this.manifestModes[this.modeIndex];
        this.modeName = this.modes[this.mode];
        this.getFan();
        this.getTemp();
    }

    getFan() {
        const arrFans = [];
        const fanValues = values(this.manifest[`${this.mode}`]);

        fanValues.map((item, index) => {
            const key = parseInt(Object.keys(this.manifest[`${this.mode}`])[index]);
            arrFans.push(key);
        });
        this.manifestFans = arrFans;
        this.fan = this.manifestFans[this.fanIndex];
        this.fanName = this.fans[this.fan];
    }

    getTemp() {
        const temp = this.manifest[`${this.mode}`][`${this.fan}`];
        this.manifestTemps = temp;
        if (typeof this.manifestTemps[this.tempIndex] == 'undefined') {
            this.tempIndex = 0;
            this.temp = this.manifestTemps[this.tempIndex];
        } else {
            this.temp = this.manifestTemps[this.tempIndex];
        }
    }

    _tapPower() {
        const remoteType = this.activeRemote.name.substring(0, 2).toUpperCase();
        this.brand = toTitleCase(this.activeRemote.name.substring(3, this.activeRemote.name.length));
        this.title = remoteType + ' ' + this.brand;
        this.getMode();

        if (this.switchedON) {
            this.stateInitial();
            this._tapPowerOFF();
        } else {
            this.stateEnabled();
            this.send();
        }
    }

    _tapPowerOFF() {
        let brandCommand = this.brand;
        this.command = brandCommand.toLowerCase() + '-0000';
        store.dispatch(remoteCommand(this.command));
        this.modeIndex = 0;
        this.fanIndex = 0;
        this.tempIndex = 0;
        this.temp = 18;
    }

    stateEnabled() {
        this.switchedON = true;
        this.$.displayContainer.style.visibility = 'visible';
        this.$.btnPower.setAttribute('icon', 'close');
        this.$.btnMode.removeAttribute('disabled');
        this.$.btnFan.removeAttribute('disabled');
        this.$.btnTempUp.removeAttribute('disabled');
        this.$.btnTempDown.removeAttribute('disabled');
    }

    send() {
        // this.brand = this.activeRemote.name.substring(2, this.activeRemote.name.length);
        let brandCommand = this.brand;
        this.command = brandCommand.toLowerCase() + '-' + this.mode + this.fan + this.temp;
        if (this.switchedON) store.dispatch(remoteCommand(this.command));
    }

    _tapMode() {
        if (this.modeIndex < this.manifestModes.length - 1) this.modeIndex++;
        else this.modeIndex = 0;
        this.fanIndex = 0;
        this.fan = this.manifestFans[this.fanIndex];
        this.fanName = this.fans[this.fan];
        this.getMode();
        // this.send();
    }

    _tapFan() {
        if (this.fanIndex < this.manifestFans.length - 1) this.fanIndex++;
        else this.fanIndex = 0;
        this.getFan();
        // this.send();
    }

    _tapUp() {
        if (this.tempIndex < this.manifestTemps.length - 1) this.tempIndex++;
        this.temp = this.manifestTemps[this.tempIndex];
        // this.send();
    }

    _tapDown() {
        if (this.tempIndex > 0) this.tempIndex--;
        this.temp = this.manifestTemps[this.tempIndex];
        // this.send();
    }
}

window.customElements.define('remote-ac', RemoteAc);
