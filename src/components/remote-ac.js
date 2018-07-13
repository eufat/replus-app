import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/hardware-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {remoteCommand} from '../actions/remote';
import {brandsList, toTitleCase} from '../utils';
import {store} from '../store.js';

const get = _.get;

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
                value: ['Auto', 'Low', 'Medium', 'High'],
            },
            modes: {
                type: Array,
                value: ['Auto', 'Cool', 'Dry', 'Heat'],
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
        };
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
    }

    ready() {
        super.ready();
        const thisRemoteAC = this;
        thisRemoteAC.setupPosition();
        thisRemoteAC.stateInitial();
        window.addEventListener('resize', () => {
            thisRemoteAC.setupPosition();
        });
    }

    resetTimeout() {
        const thisRemoteAC = this;
        clearTimeout(thisRemoteAC.timeout);
        thisRemoteAC.timeout = setTimeout(() => {
            thisRemoteAC.send();
        }, 1000);
    }

    setupPosition() {
        const thisRemoteAC = this;
        if (window.innerHeight > 470) thisRemoteAC.$.remoteContainer.style.marginTop = window.innerHeight - (64 + 70 + 120 + 270) + 'px';
        else thisRemoteAC.$.remoteContainer.style.marginTop = '10px';

        if (window.innerWidth > 350) {
            thisRemoteAC.$.mainContainer.style.width = '330px';
            thisRemoteAC.$.mainContainer.style.marginLeft = (window.innerWidth - 330) / 2 + 'px';
            // if (window.innerWidth > 640) {
            //     thisRemoteAC.$.mainContainer.style.marginLeft = ((window.innerWidth - 330)/2 - 128) + 'px';
            // }
        } else {
            thisRemoteAC.$.mainContainer.style.width = '250px';
            thisRemoteAC.$.mainContainer.style.marginLeft = (window.innerWidth - 250) / 2 + 'px';
        }
    }

    stateInitial() {
        const thisRemoteAC = this;
        thisRemoteAC.switchedON = false;
        thisRemoteAC.$.displayContainer.style.visibility = 'hidden';
        thisRemoteAC.$.btnPower.setAttribute('icon', 'power-settings-new');
        thisRemoteAC.$.btnMode.disabled = 'true';
        thisRemoteAC.$.btnFan.disabled = 'true';
        thisRemoteAC.$.btnTempUp.disabled = 'true';
        thisRemoteAC.$.btnTempDown.disabled = 'true';
    }

    _tapBack() {
        const thisRemoteAC = this;
        thisRemoteAC.stateInitial();
        // thisRemoteAC._tapPowerOFF();
    }

    getMode() {
        const arrModes = [];
        const manifestValues = _.values(this.manifest);
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
        const fanValues = _.values(this.manifest[`${this.mode}`]);

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
        const thisRemoteAC = this;
        const remoteType = thisRemoteAC.activeRemote.name.substring(0, 2).toUpperCase();
        thisRemoteAC.brand = toTitleCase(thisRemoteAC.activeRemote.name.substring(2, thisRemoteAC.activeRemote.name.length));
        thisRemoteAC.title = remoteType + ' ' + thisRemoteAC.brand;
        this.getMode();

        if (thisRemoteAC.switchedON) {
            thisRemoteAC.stateInitial();
            thisRemoteAC._tapPowerOFF();
        } else {
            thisRemoteAC.stateEnabled();
            thisRemoteAC.send();
        }
    }

    _tapPowerOFF() {
        const thisRemoteAC = this;
        let brandCommand = thisRemoteAC.brand + '';
        thisRemoteAC.command = brandCommand.toLocaleLowerCase() + '-0000';
        store.dispatch(remoteCommand(thisRemoteAC.command));
        this.modeIndex = 0;
        this.fanIndex = 0;
        this.tempIndex = 0;
        thisRemoteAC.temp = 18;
    }

    stateEnabled() {
        const thisRemoteAC = this;
        thisRemoteAC.switchedON = true;
        thisRemoteAC.$.displayContainer.style.visibility = 'visible';
        thisRemoteAC.$.btnPower.setAttribute('icon', 'close');
        thisRemoteAC.$.btnMode.removeAttribute('disabled');
        thisRemoteAC.$.btnFan.removeAttribute('disabled');
        thisRemoteAC.$.btnTempUp.removeAttribute('disabled');
        thisRemoteAC.$.btnTempDown.removeAttribute('disabled');
    }

    send() {
        const thisRemoteAC = this;
        // thisRemoteAC.brand = thisRemoteAC.activeRemote.name.substring(2, thisRemoteAC.activeRemote.name.length);
        let brandCommand = thisRemoteAC.brand + '';
        thisRemoteAC.command = brandCommand.toLocaleLowerCase() + '-' + thisRemoteAC.mode + thisRemoteAC.fan + thisRemoteAC.temp;
        if (thisRemoteAC.switchedON) store.dispatch(remoteCommand(thisRemoteAC.command));
    }

    _tapMode() {
        const thisRemoteAC = this;
        if (thisRemoteAC.modeIndex < thisRemoteAC.manifestModes.length - 1) thisRemoteAC.modeIndex++;
        else thisRemoteAC.modeIndex = 0;
        this.fanIndex = 0;
        this.fan = this.manifestFans[this.fanIndex];
        this.fanName = this.fans[this.fan];
        this.getMode();
        this.send();
    }

    _tapFan() {
        const thisRemoteAC = this;
        if (thisRemoteAC.fanIndex < thisRemoteAC.manifestFans.length - 1) thisRemoteAC.fanIndex++;
        else thisRemoteAC.fanIndex = 0;
        this.getFan();
        this.send();
    }

    _tapUp() {
        const thisRemoteAC = this;
        if (thisRemoteAC.tempIndex < thisRemoteAC.manifestTemps.length - 1) thisRemoteAC.tempIndex++;
        thisRemoteAC.temp = thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex];
        this.send();
    }

    _tapDown() {
        const thisRemoteAC = this;
        if (thisRemoteAC.tempIndex > 0) thisRemoteAC.tempIndex--;
        thisRemoteAC.temp = thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex];
        this.send();
    }
}

window.customElements.define('remote-ac', RemoteAc);
