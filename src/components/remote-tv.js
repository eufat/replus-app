import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-material/paper-material.js';
import '@polymer/paper-material/paper-material-shared-styles';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-styles/paper-styles.js';
import '@polymer/paper-styles/paper-styles-classes.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/iron-icons/hardware-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

class RemoteTv extends PolymerElement {
    static get template() {
        return html`
            <style include="iron-flex iron-flex-alignment">
                :host {
                    --iron-icon-height: 50px;
                    --iron-icon-width: 50px;

                    --paper-icon-button: {
                        color: #2B5788;
                        height: 60px;
                        width: 60px;
                    };
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
                    margin-left: 30%;
                    margin-right: 30%;
                }

                .shadow-2dp {
                    @apply --shadow-elevation-2dp;
                }
                /*@media (min-width: 640px) {
                    #toast {
                        margin-left: 268px;
                    }
                }*/
            </style>
            <div id="remoteContainer">
                <div class="horizontal layout justified">
                    <paper-fab on-tap="_tapBtn" data-command="15" icon="power-settings-new" id="btnPower"></paper-fab>
                    <paper-fab on-tap="_tapBtn" data-command="17" icon="input"></paper-fab>
                    <paper-fab on-tap="_tapBtn" data-command="10" icon="av:volume-off"></paper-fab>
                </div>

                <div class="horizontal layout justified">
                    <paper-fab on-tap="_tapBtn" data-command="13" icon="av:volume-up"></paper-fab>
                    <paper-fab on-tap="_showDialog" icon="communication:dialpad" id="btnNumpad" style="top: 45px;"></paper-fab>
                    <paper-fab on-tap="_tapBtn" data-command="11" icon="hardware:keyboard-arrow-up"></paper-fab>
                </div>

                <div class="horizontal layout justified">
                    <paper-fab on-tap="_tapBtn" data-command="14" icon="av:volume-down"></paper-fab>
                    <paper-fab on-tap="_tapBtn" data-command="12" icon="hardware:keyboard-arrow-down"></paper-fab>
                </div>
                <div id="menubuttons" class="shadow shadow-2dp">
                    <div class="horizontal layout around-justified">
                        <paper-button on-tap="_tapBtn" title="18">Menu</paper-button>
                        <paper-icon-button on-tap="_tapBtn" data-command="21" icon="hardware:keyboard-arrow-up"></paper-icon-button>
                        <paper-button on-tap="_tapBtn" title="19">Return</paper-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-icon-button on-tap="_tapBtn" data-command="23" icon="hardware:keyboard-arrow-left"></paper-icon-button>
                        <paper-button on-tap="_tapBtn" title="20">OK</paper-button>
                        <paper-icon-button on-tap="_tapBtn" data-command="24" icon="hardware:keyboard-arrow-right"></paper-icon-button>
                    </div>
                    <div class="horizontal layout center-justified">
                        <paper-icon-button on-tap="_tapBtn" data-command="22" icon="hardware:keyboard-arrow-down"></paper-icon-button>
                    </div>
                </div>
            </div>

            <paper-dialog id="dialog" entry-animation="slide-from-bottom-animation" exit-animation="fade-out-animation" on-iron-overlay-closed="_closedDialog">
                <div class="horizontal layout around-justified">
                    <paper-button on-tap="_tapBtn" title="01">1</paper-button>
                    <paper-button on-tap="_tapBtn" title="02">2</paper-button>
                    <paper-button on-tap="_tapBtn" title="03">3</paper-button>
                </div>
                <div class="horizontal layout around-justified">
                    <paper-button on-tap="_tapBtn" title="04">4</paper-button>
                    <paper-button on-tap="_tapBtn" title="05">5</paper-button>
                    <paper-button on-tap="_tapBtn" title="06">6</paper-button>
                </div>
                <div class="horizontal layout around-justified">
                    <paper-button on-tap="_tapBtn" title="07">7</paper-button>
                    <paper-button on-tap="_tapBtn" title="08">8</paper-button>
                    <paper-button on-tap="_tapBtn" title="09">9</paper-button>
                </div>
                <div class="horizontal layout center-justified">
                    <paper-button on-tap="_tapBtn" title="00">0</paper-button>
                </div>
            </paper-dialog>

            <paper-toast id="toast"></paper-toast>
        `;
    }

    static get properties() {
        return {
            remote: {
                type: String,
                observer: '_remoteChanged',
            },
        };
    }

    // ready() {
    //     super.ready();
    //     const thisRemoteTV = this;
    //     thisRemoteTV.setupPosition();
    //     thisRemoteTV.switchOn = true;

    //     window.addEventListener('resize', function(event) {
    //         thisRemoteTV.setupPosition();
    //     });
    // }

    // setupPosition() {
    //     if (window.innerHeight > 570) thisRemoteTV.$.menubuttons.style.marginTop = (window.innerHeight - 550) - 20 + 'px';
    //     else thisRemoteTV.$.menubuttons.style.marginTop = '20px';

    //     if (window.innerWidth > 375) {
    //         thisRemoteTV.$.remoteContainer.style.width = '350px';
    //         thisRemoteTV.$.remoteContainer.style.marginLeft = (window.innerWidth - 350)/2 + 'px';
    //     } else {
    //         thisRemoteTV.$.remoteContainer.style.width = '300px';
    //         thisRemoteTV.$.remoteContainer.style.marginLeft = (window.innerWidth - 300)/2 + 'px';
    //         if (window.innerWidth < 325) {
    //             thisRemoteTV.$.remoteContainer.style.width = '250px';
    //             thisRemoteTV.$.remoteContainer.style.marginLeft = (window.innerWidth - 250)/2 + 'px';
    //         }
    //     }
    // }

    // _remoteChanged() {
    //     var jenis = thisRemoteTV.remote.substring(0, 2);
    //     var merk = thisRemoteTV.remote.substring(3).toLowerCase();

    //     if (jenis == "TV") {
    //         if (merk == "lg") thisRemoteTV.codeset = "1970";
    //         else if (merk == "samsung") thisRemoteTV.codeset = "0595";
    //         else if (merk == "panasonic") thisRemoteTV.codeset = "2619";
    //         else if (merk == "sony") thisRemoteTV.codeset = "1319";
    //         else if (merk == "sharp") thisRemoteTV.codeset = "T001"; //1429
    //         else if (merk == "changhong") thisRemoteTV.codeset = "2903";
    //         else if (merk == "sanyo") thisRemoteTV.codeset = "1430";
    //         else if (merk == "toshiba") thisRemoteTV.codeset = "0339";
    //     }
    // }

    // _closedDialog() {
    //     thisRemoteTV.$.btnNumpad.removeAttribute("disabled");
    // }

    // _showDialog() {
    //     thisRemoteTV.$.dialog.open();
    //     thisRemoteTV.$.btnNumpad.setAttribute("disabled", "true");
    // }

    // _tapBtn(e) {
    //     var command = Polymer.dom(e).path[2].getAttribute('data-command');

    //     if (command == null) {
    //         command = e.target.title
    //         if (command == "") {
    //             // thisRemoteTV.$.toast.show({text: 'Please try another button.', duration: 1000});
    //             return;
    //         }
    //     }

    //     else if (command == "15") {
    //         if (!thisRemoteTV.switchOn) {
    //             command = "16";
    //             thisRemoteTV.$.btnPower.setAttribute("icon", "power-settings-new");
    //         } else {
    //            thisRemoteTV.$.btnPower.setAttribute("icon", "close");
    //         }
    //         thisRemoteTV.switchOn = !thisRemoteTV.switchOn;
    //     }

    //     thisRemoteTV.command = thisRemoteTV.codeset + command;
    //     thisRemoteTV.$.ajax.generateRequest();
    // }

    // _handleResponse() {
    //     var response = thisRemoteTV.response;
    //     if (response == 'OK') {
    //         console.log(`Sending command ${thisRemoteTV.command}: ${thisRemoteTV.response}`);
    //     } else if (response == 'NO_DEVICE') {
    //         thisRemoteTV.$.toast.show({text: 'No device is assigned for this room.', duration: 3000});
    //     } else if (response == 'NO_RESPONSE') {
    //         thisRemoteAC.$.toast.show({text: 'Device is offline.', duration: 1000});
    //     } else {
    //         thisRemoteTV.$.toast.show({text: 'Unknown error.', duration: 1000});
    //     }
    // }
}

window.customElements.define('remote-tv', RemoteTv);
