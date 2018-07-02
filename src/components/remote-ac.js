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

                .back-icon paper-fab {
                    position: absolute;
                    margin-top: 15px;
                }
            </style>
            <div id="mainContainer">
                <div class="back-icon">
                    <a href="/dashboard/rooms"><paper-fab on-tap="_tapBack" icon="arrow-back"></paper-fab></a>
                </div>
                <div id="displayContainer">
                    <div class="horizontal layout center-justified">
                        <p>{{title}}</p>
                    </div>
                    <div class="horizontal layout center-justified">
                        <p id="displayTemp">{{temp}}<sup><sup>o</sup>C</sup></p>
                    </div>
                    <div class="horizontal layout justified">
                        <p id="displayMode"></p>
                        <p id="displayFan"></p>
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
            // remote: {
            //     type: String,
            //     observer: '_changeRemote',
            // },
            mode: {type: Number, observer: '_changeMode'},
            fan: {type: Number, observer: '_changeFan'},
            command: {type: String},

            manifestFans: {type: Array, value: [0, 1, 2, 3]},
            manifestModes: {type: Array, value: [1, 2]},
            manifestTemps: {type: Array, value: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]},

            tempIndex: {type: Number, value: null},
            fanIndex: {type: Number, value: 0},
            modeIndex: {type: Number, value: 0},

            rooms: {type: Array},
            title: {type: String},
            brand: {type: String},
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.title = '';
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.activeRemote = get(state, 'remote.activeRemote');
    }

    ready() {
        super.ready();
        const thisRemoteAC = this;
        thisRemoteAC.setupPosition();
        thisRemoteAC.stateInitial();
        window.addEventListener('resize', () => {
            thisRemoteAC.setupPosition();
        });

        thisRemoteAC._changeMode();
        thisRemoteAC._changeFan();
        thisRemoteAC.parseFans();
        thisRemoteAC.parseTemps();
    }

    static get observers() {
        return [
            'parseFans(mode)',
            'parseTemps(mode, fan)',
            'resetTimeout(mode, fan, temp)',
        ];
    }

    parseFans() {
        const thisRemoteAC = this;
        // thisRemoteAC.manifestFans = [];
        // let mode = thisRemoteAC.manifest[thisRemoteAC.mode];
        // for (let fan in mode) {
        //     if (mode.hasOwnProperty(fan)) {
        //         thisRemoteAC.push('manifestFans', parseInt(fan));
        //     }
        // }
        thisRemoteAC.fanIndex = 0;
        thisRemoteAC.fan = thisRemoteAC.manifestFans[thisRemoteAC.fanIndex];
        thisRemoteAC.mode = thisRemoteAC.manifestModes[thisRemoteAC.modeIndex];
    }

    parseTemps() {
        const thisRemoteAC = this;
        // thisRemoteAC.manifestTemps = thisRemoteAC.manifest[thisRemoteAC.mode][thisRemoteAC.fan];
        if (typeof thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex] == 'undefined') {
            thisRemoteAC.tempIndex = 0;
            thisRemoteAC.temp = thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex];
        }
    }

    resetTimeout() {
        const thisRemoteAC = this;
        clearTimeout(thisRemoteAC.timeout);
        thisRemoteAC.timeout = setTimeout(() => {
            thisRemoteAC.send();
        }, 1000);
    }

    _changeMode() {
        const thisRemoteAC = this;
        thisRemoteAC.$.displayMode.innerHTML = thisRemoteAC.modes[thisRemoteAC.mode];
    }

    _changeFan() {
        const thisRemoteAC = this;
        thisRemoteAC.$.displayFan.innerHTML = thisRemoteAC.fans[thisRemoteAC.fan];
    }

    // _changeRemote() {
    //     const thisRemoteAC = this;
    //     let jenis = thisRemoteAC.remote.substring(0, 2);
    //     thisRemoteAC.brand = thisRemoteAC.remote.substring(3).toLowerCase();
    //     if (jenis == 'AC') {
    //         thisRemoteAC.stateInitial();
    //         thisRemoteAC.$.ajaxManifest.generateRequest();
    //     }
    // }

    setupPosition() {
        const thisRemoteAC = this;
        if (window.innerHeight > 470) thisRemoteAC.$.remoteContainer.style.marginTop = window.innerHeight - (64+70+120+270) + 'px';
        else thisRemoteAC.$.remoteContainer.style.marginTop = '10px';

        if (window.innerWidth > 350) {
            thisRemoteAC.$.mainContainer.style.width = '330px';
            thisRemoteAC.$.mainContainer.style.marginLeft = (window.innerWidth - 330)/2 + 'px';
            // if (window.innerWidth > 640) {
            //     thisRemoteAC.$.mainContainer.style.marginLeft = ((window.innerWidth - 330)/2 - 128) + 'px';
            // }
        } else {
            thisRemoteAC.$.mainContainer.style.width = '250px';
            thisRemoteAC.$.mainContainer.style.marginLeft = (window.innerWidth - 250)/2 + 'px';
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

    _tapPower() {
        const thisRemoteAC = this;
        const remoteType = thisRemoteAC.activeRemote.name.substring(0, 2).toUpperCase();
        thisRemoteAC.brand = toTitleCase(thisRemoteAC.activeRemote.name.substring(2, thisRemoteAC.activeRemote.name.length));
        thisRemoteAC.title = remoteType + ' ' + thisRemoteAC.brand;
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
        // thisRemoteAC.$.ajax.generateRequest();
        // thisRemoteAC.parseManifest();
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
        thisRemoteAC.mode = thisRemoteAC.manifestModes[thisRemoteAC.modeIndex];
    }

    _tapFan() {
        const thisRemoteAC = this;
        if (thisRemoteAC.fanIndex < thisRemoteAC.manifestFans.length - 1) thisRemoteAC.fanIndex++;
        else thisRemoteAC.fanIndex = 0;
        thisRemoteAC.fan = thisRemoteAC.manifestFans[thisRemoteAC.fanIndex];
    }

    _tapUp() {
        const thisRemoteAC = this;
        if (thisRemoteAC.tempIndex < thisRemoteAC.manifestTemps.length - 1) thisRemoteAC.tempIndex++;
        thisRemoteAC.temp = thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex];
    }

    _tapDown() {
        const thisRemoteAC = this;
        if (thisRemoteAC.tempIndex > 0) thisRemoteAC.tempIndex--;
        thisRemoteAC.temp = thisRemoteAC.manifestTemps[thisRemoteAC.tempIndex];
    }

    // parseManifest() {
    //     const thisRemoteAC = this;
    //     thisRemoteAC.manifestModes = [];
    //     let manifest = thisRemoteAC.manifest;
    //     for (let mode in manifest) {
    //         if (manifest.hasOwnProperty(mode)) {
    //             thisRemoteAC.push('manifestModes', parseInt(mode));
    //         }
    //     }
    //     thisRemoteAC.modeIndex = 0;
    //     thisRemoteAC.mode = thisRemoteAC.manifestModes[thisRemoteAC.modeIndex];
    // }

    // _handleResponse() {
    //     var response = thisRemoteAC.response;
    //     if (response == 'OK') {
    //         thisRemoteAC.$.toast.show({text: 'Command sent.', duration: 500});
    //     } else if (response == 'NO_DEVICE') {
    //         thisRemoteAC.$.toast.show({text: 'No device is assigned for this room.', duration: 3000});
    //     } else if (response == 'NO_RESPONSE') {
    //         thisRemoteAC.$.toast.show({text: 'Device is offline.', duration: 1000});
    //     } else {
    //         thisRemoteAC.$.toast.show({text: 'Unknown error.', duration: 1000});
    //     }
    // }
}

window.customElements.define('remote-ac', RemoteAc);
