import {PolymerElement, html} from '@polymer/polymer';
import {connect} from 'pwa-helpers/connect-mixin';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-checkbox';
import '@polymer/paper-toggle-button';
import '@polymer/paper-material';
import '@polymer/paper-material/paper-material-shared-styles';
import '@polymer/paper-button';
import '@polymer/paper-spinner/paper-spinner';
import '@polymer/paper-toast';
import '@polymer/paper-card';

import '@polymer/paper-fab';
import '@polymer/paper-icon-button';
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

import '@material/mwc-button';
import '@material/mwc-icon';

import {createSchedule, fetchIR, removeSchedule} from '../actions/remote.js';
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
                    /* margin-left: calc((100vw - 400px) / 2); */
                    /* padding-bottom: 150px; */
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

                .paper-container {
                    margin: 0 auto;
                    max-width: 960px;
                    padding-bottom: 50px;
                }

                .add-new-schedule {
                    text-align: center;
                }

                paper-material {
                    display: block;
                    margin: 20px;
                    padding: 10px 20px;
                    background-color: white;
                    border-radius: 5px;

                }

                paper-card {
                    display: block;
                    margin: 20px 20px 0;
                }

                .card-heading {
                    @apply(--paper-font-headline);
                    color: #777;
                }

                .card-time {
                    background: var(--paper-grey-400);
                    border-radius: 10px;
                    color: #fff;
                    padding: 5px;
                    text-align: center;
                    width: 70px;
                }

                paper-button#btnDeleteSchedule {
                    background: #fff;
                    color: #c0392b;
                    font-weight: normal;
                    margin: auto;
                }

                @media (max-width: 500px) {
                    #container {
                        width: 250px;
                        /* margin-left: calc((100vw - 280px) / 2); */
                    }
                }
            </style>
            <paper-dialog id="scheduleDialog">
                <div id="container" class="vertical layout">
                    <div class="horizontal layout justified">
                        <p>One time</p>
                        <paper-toggle-button id="toggleRepeated" checked="{{isRepeated}}" on-active-changed="_changeIsRepeated"></paper-toggle-button>
                        <p>Repeated</p>
                    </div>
                    <div id="containerTime" class="horizontal layout">
                        <paper-dropdown-menu id="dropdownHour" label="Hour" noink no-animations>
                            <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenHour}}" on-selected-changed="_changeTime">
                                <template is="dom-repeat" items="{{hours}}" as="hour">
                                    <paper-item name="{{hour}}">{{hour}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu id="dropdownMinute" label="Minute" noink no-animations>
                            <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenMinute}}" on-selected-changed="_changeTime">
                                <template is="dom-repeat" items="{{minutes}}" as="minute">
                                    <paper-item name="{{minute}}">{{minute}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu id="dropdownPeriod" label="AM/PM" noink no-animations>
                            <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenPeriod}}" on-selected-changed="_changeTime">
                                <paper-item name="AM">AM</paper-item>
                                <paper-item name="PM">PM</paper-item>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                    <div id="containerDate" class="horizontal layout">
                        <paper-dropdown-menu id="dropdownMonth" label="Month" noink no-animations>
                            <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenMonth}}" on-selected-changed="calculateYear">
                                <template is="dom-repeat" items="{{months}}" as="month">
                                    <paper-item name="{{month}}">{{month}}</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu id="dropdownDate" label="Date" noink no-animations>
                            <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenDate}}" on-selected-changed="calculateYear">
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
                    <paper-dropdown-menu id="dropdownAppliance" label="Appliance to schedule" noink no-animations>
                        <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="name" selected="{{choosenAppliance}}" on-selected-changed="_changeAppliance">
                            <template is="dom-repeat" items="{{remotes}}" as="remote">
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
                            <paper-dropdown-menu id="dropdownMode" label="Mode" noink no-animations>
                                <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="mode" selected="{{choosenMode}}">
                                    <template is="dom-repeat" items="{{modeTitle}}" as="mode">
                                        <paper-item mode="{{mode}}" on-click="selectedMode">{{mode}}</paper-item>
                                    </template>
                                </paper-listbox>
                            </paper-dropdown-menu>
                            <paper-dropdown-menu id="dropdownFan" label="Fan speed" noink no-animations>
                                <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="fan" selected="{{choosenFan}}">
                                    <template is="dom-repeat" items="{{fanTitle}}" as="fan">
                                        <paper-item fan="{{fan}}" on-click="selectedFan">{{fan}}</paper-item>
                                    </template>
                                </paper-listbox>
                            </paper-dropdown-menu>
                            <paper-dropdown-menu id="dropdownTemp" label="Temperature" noink no-animations>
                                <paper-listbox slot="dropdown-content" class="dropdown-content" attr-for-selected="temp" selected="{{choosenTemp}}">
                                    <template is="dom-repeat" items="{{tempTitle}}" as="temp">
                                        <paper-item temp="{{temp}}">{{temp}}</paper-item>
                                    </template>
                                </paper-listbox>
                            </paper-dropdown-menu>
                        </div>
                    </div>
                    <paper-material id="materialNote">
                        <p>All schedule is (currently) set to GMT+7 timezone.</p>
                    </paper-material>
                    <paper-button id="btnAdd" raised on-tap="_tapAdd">Save schedule</paper-button>
                    <div class="horizontal layout center-justified">
                        <paper-spinner id="spinner" active></paper-spinner>
                    </div>
                </div>
            </paper-dialog>
            <template is="dom-repeat" items="{{schedules}}" as="schedule">
                <paper-card>
                    <div class="card-content">
                        <div class="horizontal layout justified">
                            <div class="card-heading">[[schedule.titleRemote]]</div>
                            <div class="card-time">[[schedule.titleTime]]</div>
                        </div>
                        <div>[[schedule.titleCommand]]</div>
                        <div>[[schedule.titleDay]]</div>
                    </div>
                    <div class="card-actions horizontal layout end-justified">
                        <paper-button title="[[schedule.titleRemote]]" id="btnDeleteSchedule" on-tap="_tapDeleteSchedule">Delete</paper-button>
                    </div>
                </paper-card>
            </template>
            <div class="rooms-container">
                <div class="paper-container">
                    <paper-material elevation="0" class="add-new-schedule">
                        <mwc-button
                            label="Add new schedule"
                            icon="add"
                            on-click="_showSchedule">
                        </mwc-button>
                    </paper-material>
                </div>
            </div>
            <paper-toast id="toast"></paper-toast>
        `;
    }

    static get properties() {
        return {
            uid: String,
            choosenDay: {
                type: Object,
                value: {
                    '1': false,
                    '2': false,
                    '3': false,
                    '4': false,
                    '5': false,
                    '6': false,
                    '7': false,
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
            schedules: {
                type: Array,
                // value: [
                //     {
                //         id: '-LHXCq_MsS_323O4vVTr',
                //         titleCommand: 'Turn ON',
                //         titleDay: 'January 01 2019, 01:00',
                //         titleRemote: 'TV Sony Dummy',
                //         titleTime: '01:00',
                //     },
                //     {
                //         id: '-LHXk-abfalkkPfozw-5',
                //         titleCommand: 'Turn ON',
                //         titleDay: 'January 01 2019, 10:00',
                //         titleRemote: 'TV Samsung Dummy',
                //         titleTime: '10:00',
                //     }
                // ],
            },
            scheduleList: {
                type: Array,
            },
            manifest: Object,
            mode: Number,
            manifestModes: Array,
            modeTitle: Array,

            fan: Number,
            manifestFans: Array,
            fanTitle: Array,
            tempTitle: Array,

            OKtime: {type: Boolean, value: false, observer: '_OKtime'},
            OKdate: {type: Boolean, value: false, observer: '_OKdate'},
            OKday: {type: Boolean, value: false, observer: '_OKday'},
            OKappliance: {type: Boolean, value: false},

            isRepeated: {
                type: Boolean,
            },
            remotes: {type: Array},
        };
    }

    constructor() {
        super();
        this.remotes = [];
        this.manifest = {};
        this.scheduleList = [];
    }

    _stateChanged(state) {
        this.uid = get(state, 'app.currentUser.uid');
        let stateRemotes = get(state, 'remote.activeRoom.remotes') || [];
        stateRemotes = stateRemotes.map((remote) => {
            const name = get(remote, 'name');
            const nameUpperCased = name.toUpperCase();
            return nameUpperCased;
        });
        this.remotes = stateRemotes;
        this.manifest = get(state, 'remote.manifest');
    }

    ready() {
        super.ready();
        this.stateInitial();
    }

    _showSchedule() {
        this.$.scheduleDialog.open();
    }

    _tapDeleteSchedule(e) {
        // const scheduleID = e.target.title;
        const scheduleTitle = e.target.title;
        let i;
        for (i=0; i<this.scheduleList.length; i++) {
            if (this.scheduleList[i].titleRemote == scheduleTitle) {
                // delete this.scheduleList[i];
                this.scheduleList.splice(i, i+1);
            }
        }
        this.schedules = [];
        this.schedules = this.scheduleList;
        // store.dispatch(removeSchedule(scheduleID));
    }

    _OKtime(OK) {
        if (typeof this != 'undefined') {
            if (OK) this.setCheckboxState('enabled');
            else this.setCheckboxState('disabled');
        }
    }

    _OKdate(OK) {
        if (typeof this != 'undefined') {
            if (OK) this.$.dropdownAppliance.removeAttribute('disabled');
            else this.$.dropdownAppliance.setAttribute('disabled', true);
        }
    }

    _OKday(OK) {
        if (typeof this != 'undefined') {
            if (OK) this.$.dropdownAppliance.removeAttribute('disabled');
            else {
                this.choosenAppliance = '';
                this.setToggleONState('disabled');
                this.$.dropdownAppliance.setAttribute('disabled', true);
            }
        }
    }

    stateInitial() {
        this.clearAll();
        this.setCheckboxState('disabled');
        this.$.dropdownAppliance.setAttribute('disabled', true);
        this.setToggleONState('disabled');
        this.setButtonState('disabled');
    }

    clearAll() {
        this.choosenHour = '';
        this.choosenMinute = '';
        this.choosenPeriod = '';
        this.choosenMonth = '';
        this.choosenDate = '';
        this.calculatedYear = '';
        this.$.checkbox1.active = false;
        this.$.checkbox2.active = false;
        this.$.checkbox3.active = false;
        this.$.checkbox4.active = false;
        this.$.checkbox5.active = false;
        this.$.checkbox6.active = false;
        this.$.checkbox7.active = false;
        this.choosenAppliance = '';
        this.isON = false;
        this.manifestModes = [];
        this.manifestFans = [];
        this.temps = [];
        this.choosenMode = '';
        this.choosenFan = '';
        this.choosenTemp = '';
    }

    setCheckboxState(state) {
        if (state == 'enabled') {
            this.$.checkbox1.removeAttribute('disabled');
            this.$.checkbox2.removeAttribute('disabled');
            this.$.checkbox3.removeAttribute('disabled');
            this.$.checkbox4.removeAttribute('disabled');
            this.$.checkbox5.removeAttribute('disabled');
            this.$.checkbox6.removeAttribute('disabled');
            this.$.checkbox7.removeAttribute('disabled');
        } else if (state == 'disabled') {
            this.$.checkbox1.setAttribute('disabled', true);
            this.$.checkbox2.setAttribute('disabled', true);
            this.$.checkbox3.setAttribute('disabled', true);
            this.$.checkbox4.setAttribute('disabled', true);
            this.$.checkbox5.setAttribute('disabled', true);
            this.$.checkbox6.setAttribute('disabled', true);
            this.$.checkbox7.setAttribute('disabled', true);
        }
    }

    setToggleONState(state) {
        if (state == 'enabled') {
            this.$.textON.style.color = '#000';
            this.$.toggleON.removeAttribute('disabled');
        } else if (state == 'disabled') {
            this.$.textON.style.color = '#bdbdbd';
            this.$.toggleON.setAttribute('disabled', 'true');
        }
    }

    setButtonState(state) {
        if (state == 'enabled') {
            this.$.spinner.style.display = 'none';
            this.$.btnAdd.style.visibility = 'visible';
            this.$.btnAdd.removeAttribute('disabled');
        } else if (state == 'disabled') {
            this.$.spinner.style.display = 'none';
            this.$.btnAdd.style.visibility = 'visible';
            this.$.btnAdd.setAttribute('disabled', 'true');
        } else if (state == 'spinner') {
            this.$.spinner.style.display = 'block';
            this.$.btnAdd.style.visibility = 'hidden';
            this.$.btnAdd.setAttribute('disabled', 'true');
        }
    }

    _changeIsRepeated() {
        setTimeout(() => {
            this.stateInitial();
            if (this.isRepeated) {
                this.$.containerDate.style.visibility = 'hidden';
                this.$.containerDay.style.visibility = 'visible';
                this.scheduleType = 'repeated';
            } else {
                this.$.containerDate.style.visibility = 'visible';
                this.$.containerDay.style.visibility = 'hidden';
                this.scheduleType = 'once';
            }
        }, 100);
    }

    _changeTime() {
        this.calculateYear();
        setTimeout(() => {
            if (this.choosenHour != '' && this.choosenMinute != '' && this.choosenPeriod != '') this.OKtime = true;
            else this.OKtime = false;
        }, 100);
    }

    _changeAppliance() {
        this.OKappliance = true;
        this.setToggleONState('enabled');
        this.setButtonState('enabled');
        this.isON = false;
        setTimeout(() => {
            const type = this.choosenAppliance.substring(0, 2);
            const brand = this.choosenAppliance.substring(3).toLowerCase();
            if (type == 'AC') {
                store.dispatch(fetchIR(brand));
            }
            this.choosenType = type;
            this.choosenBrand = brand;
        }, 100);
    }

    calculateYear() {
        setTimeout(() => {
            if (this.choosenHour != '' && this.choosenMinute != '' && this.choosenPeriod != '' && this.choosenDate != '' && this.choosenMonth != '') {
                const hour = this.choosenHour;
                const minute = this.choosenMinute;
                const period = this.choosenPeriod;
                const date = this.choosenDate;
                const month = this.choosenMonth;
                const yearNow = new Date().getFullYear();
                const epochNow = new Date().getTime();
                const epoch = new Date(`${month} ${date}, ${yearNow} ${hour}:${minute} ${period}`).getTime();

                this.calculatedYear = epoch > epochNow ? yearNow : yearNow + 1;
                this.OKdate = true;
                this.$.dropdownAppliance.removeAttribute('disabled');
            }
        }, 100);
    }

    _changeDay(e) {
        if (typeof this != 'undefined') {
            let choosenDay = this.choosenDay;
            choosenDay[e.target.name] = e.detail.value;

            setTimeout(() => {
                let checkedCount = 0;
                for (let key in choosenDay) {
                    if (choosenDay.hasOwnProperty(key)) if (choosenDay[key] == true) checkedCount++;
                }

                if (checkedCount == 0) {
                    this.OKday = false;
                    if (this.isRepeated) this.$.toast.show({text: 'Select at least one day.', duration: 3000});
                } else {
                    this.OKday = true;
                }
            }, 100);
        }
    }

    _tapAdd() {
        let choosenDay = this.choosenDay;
        let choosenHour = parseInt(this.choosenHour);
        let choosenPeriod = this.choosenPeriod;

        // convert to 24H format
        if (choosenHour == 12) choosenHour = 0;
        if (choosenPeriod == 'PM') choosenHour = choosenHour + 12;
        if (choosenHour < 10) choosenHour = '0' + choosenHour;

        // get titleTime
        this.titleTime = `${choosenHour}:${this.choosenMinute}`;

        // vary command based on appliance type
        if (this.choosenType == 'AC') {
            // this.command = `${this.choosenBrand}-${this.choosenMode}${this.choosenFan}${this.choosenTemp}`;
            // this.titleCommand = `Set to ${this.choosenTemp}C, ${this.modes[this.choosenMode]}, fan ${this.fans[this.choosenFan]}`;
            this.command = `${this.choosenBrand}-${this.mode}${this.fan}${this.choosenTemp}`;
            this.titleCommand = `Set to ${this.choosenTemp}C, ${this.modes[this.mode]}, fan ${this.fans[this.mode]}`;
            if (!this.isON) this.command = `${this.choosenBrand}-0000`;
        } else {
            this.titleCommand = 'Turn ON';
            let merk = this.choosenBrand;
            let codeset = '';

            if (merk == 'lg') codeset = '1970';
            else if (merk == 'samsung') codeset = '0595';
            else if (merk == 'panasonic') codeset = '2619';
            else if (merk == 'sony') codeset = '1319';
            else if (merk == 'sharp') codeset = '1429';
            else if (merk == 'changhong') codeset = '2903';
            else if (merk == 'sanyo') codeset = '1430';
            else if (merk == 'toshiba') codeset = '0339';
            if (this.isON) this.command = `${codeset}15`;
            else this.command = `${codeset}16`;
        }

        // get titleCommand based on ON/OFF
        if (!this.isON) this.titleCommand = 'Turn OFF';

        if (this.isRepeated) {
            let days = [];
            let daysName = [];
            let daysCount = 0;

            for (let key in choosenDay) {
                if (choosenDay.hasOwnProperty(key)) {
                    if (choosenDay[key]) {
                        days.push(parseInt(key));
                        daysName.push(this.days[parseInt(key)]);
                        daysCount++;
                    }
                }
            }

            // Return 'Everyday' if every day is selected
            let titleDay = '';
            if (daysCount == 7) titleDay = 'Everyday';
            else titleDay = daysName.toString().replace(/,/g, ', ');
            this.titleDay = titleDay;

            let cronExp = `0 ${this.choosenMinute} ${choosenHour} * * ${days.toString()}`;
            this.schedule = cronExp;
        } else {
            let schedule = `${this.choosenMonth} ${this.choosenDate} ${this.calculatedYear}, ${choosenHour}:${this.choosenMinute}`;
            this.titleDay = schedule;
            this.schedule = schedule;
        }

        const schedule = {
            uid: this.uid,
            room: this.roomKey,
            command: this.command,
            scheduleType: this.scheduleType,
            schedule: this.schedule,
            titleRemote: this.choosenAppliance,
            titleCommand: this.titleCommand,
            titleDay: this.titleDay,
            titleTime: this.titleTime,
        };

        const schedules = {
            id: '-LIPYX14LutGJe1fKJwZ',
            titleCommand: this.titleCommand,
            titleDay: this.titleDay,
            titleRemote: this.choosenAppliance,
            titleTime: this.titleTime,
        };

        this.schedules = [];
        this.scheduleList.push(schedules);
        this.schedules = this.scheduleList;

        // store.dispatch(createSchedule(schedule));
        this.$.scheduleDialog.close();
        this.stateInitial();
    }

    getMode() {
        const arrModes = [];
        const modeName = [];
        const manifestValues = _.values(this.manifest);
        manifestValues.map((item, index) => {
            const key = parseInt(Object.keys(this.manifest)[index]);
            arrModes.push(key);
            modeName.push(this.modes[arrModes[index]]);
        });
        this.manifestModes = arrModes;
        this.modeTitle = modeName;
    }

    selectedMode(e) {
        const modeName = e.target.mode;
        if (modeName == 'Auto') {
            this.mode = 0;
        } else if (modeName == 'Cool') {
            this.mode = 1;
        } else if (modeName == 'Dry') {
            this.mode = 2;
        } else if (modeName == 'Heat') {
            this.mode = 3;
        }
        this.getFan();
    }

    getFan() {
        const arrFans = [];
        const fanName = [];
        const fanValues = _.values(this.manifest[`${this.mode}`]);

        fanValues.map((item, index) => {
            const key = parseInt(Object.keys(this.manifest[`${this.mode}`])[index]);
            arrFans.push(key);
            fanName.push(this.fans[arrFans[index]]);
        });
        this.manifestFans = arrFans;
        this.fanTitle = fanName;
    }

    selectedFan(e) {
        const fanName = e.target.fan;
        if (fanName == 'Auto') {
            this.fan = 0;
        } else if (fanName == 'Low') {
            this.fan = 1;
        } else if (fanName == 'Medium') {
            this.fan = 2;
        } else if (fanName == 'High') {
            this.fan = 3;
        }
        this.getTemp();
    }

    getTemp() {
        const temp = this.manifest[`${this.mode}`][`${this.fan}`];
        this.tempTitle = temp;
    }

    _changeIsON() {
        this.manifest = store.getState().remote.manifest;
        this.getMode();
        setTimeout(() => {
            if (this.isON) {
                this.$.containerCommand.style.display = 'block';
                this.$.textON.innerHTML = 'Turn appliance ON';
                if (this.choosenType == 'AC') {
                    this.$.containerAC.style.display = 'block';
                    // this.$.ajaxManifest.generateRequest();
                } else {
                    this.$.containerAC.style.display = 'none';
                }
            } else {
                this.$.containerCommand.style.display = 'none';
                this.$.textON.innerHTML = 'Turn appliance OFF';
            }
        }, 100);
    }
}

window.customElements.define('room-add-schedule', AddSchedule);
