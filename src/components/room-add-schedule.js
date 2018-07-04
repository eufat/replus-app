import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-material/paper-material.js';
import '@polymer/paper-material/paper-material-shared-styles';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-toast/paper-toast.js';

import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
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

import {store} from '../store.js';

const get = _.get;

class AddSchedule extends connect(store)(PolymerElement) {
    static get template() {
        return html`
            <style include="iron-flex iron-flex-alignment">
                :host {
                    display: block;
                    overflow: auto;
                }

                #btnAdd {
                    /*color: white;*/
                    /*font-weight: normal;*/
                    margin-top: 25px;
                }

                #container {
                    width: 400px;
                    margin-left: calc((100vw - 400px) / 2);
                    padding-bottom: 150px;
                }

                #containerDay {
                    margin-top: -45px;
                }

                #dropdownDate {
                    margin-right: 5px;
                    width: 25%;
                }

                #dropdownFan {
                    margin-right: 5px;
                    width: 30%;
                }

                #dropdownMinute {
                    margin-left: 5px;
                    margin-right: 5px;
                }

                #dropdownMode {
                    margin-right: 5px;
                    width: 30%;
                }

                #dropdownMonth {
                    margin-right: 5px;
                    width: 50%;
                }

                #dropdownTemp {
                    width: 30%;
                }

                #dropdownType {
                    width: 100%;
                }

                #inputYear {
                    width: 25%;
                }

                #materialNote {
                    background: #fff;
                    color: #777;
                    padding: 10px;
                }

                #spinner {
                    --paper-spinner-layer-1-color: var(--app-primary-color);
                    --paper-spinner-layer-3-color: var(--app-primary-color);
                    --paper-spinner-layer-2-color: #3498db;
                    --paper-spinner-layer-4-color: #3498db;
                    margin-top: -35px;
                }

                #toggleRepeated {
                    --paper-toggle-button-unchecked-bar-color:  var(--primary-color);
                    --paper-toggle-button-unchecked-button-color:  var(--primary-color);
                    --paper-toggle-button-unchecked-ink-color: var(--primary-color);
                }

                @media (max-width: 500px) {
                    #container {
                        width: 280px;
                        margin-left: calc((100vw - 280px) / 2);
                    }
                }
            </style>
            <!-- <div id="container" class="vertical layout">
                <h1>Add Schedule Component</h1>
            </div> -->
            <div id="container" class="vertical layout">
                <div class="horizontal layout justified">
                    <p>One time</p>
                    <paper-toggle-button id="toggleRepeated" checked="{{isRepeated}}" on-active-changed="_changeIsRepeated"></paper-toggle-button>
                    <p>Repeated</p>
                </div>
                <div id="containerTime" class="horizontal layout">
                    <paper-dropdown-menu id="dropdownHour" label="Hour">
                        <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenHour}}" on-selected-changed="_changeTime">
                            <template is="dom-repeat" items="{{hours}}" as="hour">
                                <paper-item name="{{hour}}">{{hour}}</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu id="dropdownMinute" label="Minute">
                        <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenMinute}}" on-selected-changed="_changeTime">
                            <template is="dom-repeat" items="{{minutes}}" as="minute">
                                <paper-item name="{{minute}}">{{minute}}</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu id="dropdownPeriod" label="AM/PM">
                        <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenPeriod}}" on-selected-changed="_changeTime">
                            <paper-item name="AM">AM</paper-item>
                            <paper-item name="PM">PM</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div id="containerDate" class="horizontal layout">
                    <paper-dropdown-menu id="dropdownMonth" label="Month">
                        <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenMonth}}" on-selected-changed="calculateYear">
                            <template is="dom-repeat" items="{{months}}" as="month">
                                <paper-item name="{{month}}">{{month}}</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu id="dropdownDate" label="Date">
                        <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenDate}}" on-selected-changed="calculateYear">
                            <template is="dom-repeat" items="{{dates}}" as="date">
                                <paper-item name="{{date}}">{{date}}</paper-item>
                            </template>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-input disabled id="inputYear" label="Year" value="{{calculatedYear}}"></paper-input>
                </div>
                <div id="containerDay" class="horizontal layout justified">
                    <div class="vertical layout"><paper-checkbox id="checkbox1" name="1" on-active-changed="_changeDay"></paper-checkbox>Mon</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox2" name="2" on-active-changed="_changeDay"></paper-checkbox>Tue</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox3" name="3" on-active-changed="_changeDay"></paper-checkbox>Wed</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox4" name="4" on-active-changed="_changeDay"></paper-checkbox>Thu</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox5" name="5" on-active-changed="_changeDay"></paper-checkbox>Fri</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox6" name="6" on-active-changed="_changeDay"></paper-checkbox>Sat</div>
                    <div class="vertical layout"><paper-checkbox id="checkbox7" name="7" on-active-changed="_changeDay"></paper-checkbox>Sun</div>
                </div>
                <paper-dropdown-menu id="dropdownAppliance" label="Appliance to schedule">
                    <paper-listbox class="dropdown-content" attr-for-selected="name" selected="{{choosenAppliance}}" on-selected-changed="_changeAppliance">
                        <template is="dom-repeat" items="{{remotes}}" as="remote" sort="_sort">
                            <paper-item name="{{remote}}">{{remote}}</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>
                <div class="horizontal layout justified">
                    <p id="textON">Turn appliance OFF</p>
                    <paper-toggle-button id="toggleON" checked="{{isON}}" on-active-changed="_changeIsON"></paper-toggle-button>
                </div>
                <div id="containerCommand">
                    <div id="containerAC" class="horizontal layout justified">
                        <paper-dropdown-menu id="dropdownMode" label="Mode">
                            <paper-listbox class="dropdown-content" attr-for-selected="mode" selected="{{choosenMode}}" on-selected-changed="_changeMode">
                                <template is="dom-repeat" items="{{manifestModes}}" as="mode">
                                    <paper-item mode="{{mode}}">{{getMode(mode)}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu id="dropdownFan" label="Fan speed">
                            <paper-listbox class="dropdown-content" attr-for-selected="fan" selected="{{choosenFan}}" on-selected-changed="">
                                <template is="dom-repeat" items="{{manifestFans}}" as="fan">
                                    <paper-item fan="{{fan}}">{{getFan(fan)}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu id="dropdownTemp" label="Temperature">
                            <paper-listbox class="dropdown-content" attr-for-selected="temp" selected="{{choosenTemp}}" on-selected-changed="">
                                <template is="dom-repeat" items="{{temps}}" as="temp">
                                    <paper-item temp="{{temp}}">{{temp}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                </div>
                <paper-material id="materialNote">
                    <p>All schedule is (currently) set to GMT+7 timezone.</p>
                </paper-material>
                <paper-button id="btnAdd" raised on-tap="_tapAdd">Add schedule</paper-button>
                <div class="horizontal layout center-justified">
                    <paper-spinner id="spinner" active></paper-spinner>
                </div>
            </div>
            <paper-toast id="toast"></paper-toast>
        `;
    }

    static get properties() {
        return {
            choosenDay: {
                type: Object,
                value: {
                    '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false,
                },
            },

            dates: {
                type: Array,
                value: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '24', '25', '26', '27', '28', '29', '30', '31'],
            },
            days: {
                type: Array,
                value: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            },
            fans: {
                type: Array,
                value: ['Auto', 'Low', 'Medium', 'High'],
            },
            hours: {
                type: Array,
                value: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
            },
            minutes: {
                type: Array,
                value: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
            },
            modes: {
                type: Array,
                value: ['Auto', 'Cool', 'Dry', 'Heat'],
            },
            months: {
                type: Array,
                value: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            },

            OKtime: {type: Boolean, value: false, observer: '_OKtime'},
            OKdate: {type: Boolean, value: false, observer: '_OKdate'},
            OKday: {type: Boolean, value: false, observer: '_OKday'},
            OKappliance: {type: Boolean, value: false},

            isRepeated: {
                type: Boolean,
            },
        };
    }

    constructor() {
        super();
    }

    _stateChanged(state) {

    }

    ready() {
        super.ready();
        const thisRoomAddSchedule = this;
        thisRoomAddSchedule.stateInitial();
    }

    _OKtime(OK) {
        const thisRoomAddSchedule = this;
        if (typeof thisRoomAddSchedule != 'undefined') {
            if (OK) thisRoomAddSchedule.setCheckboxState('enabled');
            else thisRoomAddSchedule.setCheckboxState('disabled');
        }
    }

    _OKdate(OK) {
        const thisRoomAddSchedule = this;
        if (typeof thisRoomAddSchedule != 'undefined') {
            if (OK) thisRoomAddSchedule.$.dropdownAppliance.removeAttribute('disabled');
            else thisRoomAddSchedule.$.dropdownAppliance.setAttribute('disabled', true);
        }
    }

    _OKday(OK) {
        const thisRoomAddSchedule = this;
        if (typeof thisRoomAddSchedule != 'undefined') {
            if (OK) thisRoomAddSchedule.$.dropdownAppliance.removeAttribute('disabled');
            else {
                thisRoomAddSchedule.choosenAppliance = '';
                thisRoomAddSchedule.setToggleONState('disabled');
                thisRoomAddSchedule.$.dropdownAppliance.setAttribute('disabled', true);
            }
        }
    }

    stateInitial() {
        const thisRoomAddSchedule = this;
        thisRoomAddSchedule.clearAll();
        thisRoomAddSchedule.setCheckboxState('disabled');
        thisRoomAddSchedule.$.dropdownAppliance.setAttribute('disabled', true);
        thisRoomAddSchedule.setToggleONState('disabled');
        thisRoomAddSchedule.setButtonState('disabled');
    }

    clearAll() {
        const thisRoomAddSchedule = this;
        thisRoomAddSchedule.choosenHour = '';
        thisRoomAddSchedule.choosenMinute = '';
        thisRoomAddSchedule.choosenPeriod = '';
        thisRoomAddSchedule.choosenMonth = '';
        thisRoomAddSchedule.choosenDate = '';
        thisRoomAddSchedule.calculatedYear = '';
        thisRoomAddSchedule.$.checkbox1.active = false;
        thisRoomAddSchedule.$.checkbox2.active = false;
        thisRoomAddSchedule.$.checkbox3.active = false;
        thisRoomAddSchedule.$.checkbox4.active = false;
        thisRoomAddSchedule.$.checkbox5.active = false;
        thisRoomAddSchedule.$.checkbox6.active = false;
        thisRoomAddSchedule.$.checkbox7.active = false;
        thisRoomAddSchedule.choosenAppliance = '';
        thisRoomAddSchedule.isON = false;
        thisRoomAddSchedule.manifestModes = [];
        thisRoomAddSchedule.manifestFans = [];
        thisRoomAddSchedule.temps = [];
        thisRoomAddSchedule.choosenMode = '';
        thisRoomAddSchedule.choosenFan = '';
        thisRoomAddSchedule.choosenTemp = '';
    }

    setCheckboxState(state) {
        const thisRoomAddSchedule = this;
        if (state == 'enabled') {
            thisRoomAddSchedule.$.checkbox1.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox2.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox3.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox4.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox5.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox6.removeAttribute('disabled');
            thisRoomAddSchedule.$.checkbox7.removeAttribute('disabled');
        } else if (state == 'disabled') {
            thisRoomAddSchedule.$.checkbox1.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox2.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox3.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox4.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox5.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox6.setAttribute('disabled', true);
            thisRoomAddSchedule.$.checkbox7.setAttribute('disabled', true);
        }
    }

    setToggleONState(state) {
        const thisRoomAddSchedule = this;
        if (state == 'enabled') {
            thisRoomAddSchedule.$.textON.style.color = '#000';
            thisRoomAddSchedule.$.toggleON.removeAttribute('disabled');
        } else if (state == 'disabled') {
            thisRoomAddSchedule.$.textON.style.color = '#bdbdbd';
            thisRoomAddSchedule.$.toggleON.setAttribute('disabled', 'true');
        }
    }

    setButtonState(state) {
        const thisRoomAddSchedule = this;
        if (state == 'enabled') {
            thisRoomAddSchedule.$.spinner.style.display = 'none';
            thisRoomAddSchedule.$.btnAdd.style.visibility = 'visible';
            thisRoomAddSchedule.$.btnAdd.removeAttribute('disabled');
        } else if (state == 'disabled') {
            thisRoomAddSchedule.$.spinner.style.display = 'none';
            thisRoomAddSchedule.$.btnAdd.style.visibility = 'visible';
            thisRoomAddSchedule.$.btnAdd.setAttribute('disabled', 'true');
        } else if (state == 'spinner') {
            thisRoomAddSchedule.$.spinner.style.display = 'block';
            thisRoomAddSchedule.$.btnAdd.style.visibility = 'hidden';
            thisRoomAddSchedule.$.btnAdd.setAttribute('disabled', 'true');
        }
    }

    _changeIsRepeated() {
        const thisRoomAddSchedule = this;
        setTimeout(() => {
            thisRoomAddSchedule.stateInitial();
            if (thisRoomAddSchedule.isRepeated) {
                thisRoomAddSchedule.$.containerDate.style.visibility = 'hidden';
                thisRoomAddSchedule.$.containerDay.style.visibility = 'visible';
                thisRoomAddSchedule.scheduleType = 'repeated';
            } else {
                thisRoomAddSchedule.$.containerDate.style.visibility = 'visible';
                thisRoomAddSchedule.$.containerDay.style.visibility = 'hidden';
                thisRoomAddSchedule.scheduleType = 'once';
            }
        }, 100);
    }

    _changeDay(e) {
        const thisRoomAddSchedule = this;
        if (typeof thisRoomAddSchedule != 'undefined') {
            let choosenDay = thisRoomAddSchedule.choosenDay;
            choosenDay[e.target.name] = e.detail.value;

            setTimeout(() => {
                let checkedCount = 0;
                for (let key in choosenDay) {
                    if (choosenDay.hasOwnProperty(key)) if (choosenDay[key] == true) checkedCount++;
                }

                if (checkedCount == 0) {
                    thisRoomAddSchedule.OKday = false;
                    if (thisRoomAddSchedule.isRepeated) thisRoomAddSchedule.$.toast.show({text: 'Select at least one day.', duration: 3000});
                } else {
                    thisRoomAddSchedule.OKday = true;
                }
            }, 100);
        }
    }

    _changeIsON() {
        const thisRoomAddSchedule = this;
        setTimeout(() => {
            if (thisRoomAddSchedule.isON) {
                thisRoomAddSchedule.$.containerCommand.style.display = 'block';
                thisRoomAddSchedule.$.textON.innerHTML = 'Turn appliance ON';
                if (thisRoomAddSchedule.choosenType == 'AC') {
                    thisRoomAddSchedule.$.containerAC.style.display = 'block';
                    thisRoomAddSchedule.$.ajaxManifest.generateRequest();
                } else {
                    thisRoomAddSchedule.$.containerAC.style.display = 'none';
                }
            } else {
                thisRoomAddSchedule.$.containerCommand.style.display = 'none';
                thisRoomAddSchedule.$.textON.innerHTML = 'Turn appliance OFF';
            }
        }, 100);
    }
}

window.customElements.define('room-add-schedule', AddSchedule);
