import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import io from 'socket.io-client';
import dayjs from 'dayjs';

import get from 'lodash/get';
import values from 'lodash/values';
import concat from 'lodash/concat';

import '@polymer/paper-card';
import '@polymer/paper-material';
import '@polymer/paper-icon-button';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox';
import '@polymer/iron-icons/iron-icons';

import {env} from '../configs.js';
import {getDateFromFilename, getTVBrandFromCodeset, getTVCommandFromCodeset, toTitleCase, modesAC, fansAC, camelToSentence, log} from '../utils.js';
import {store} from '../store.js';
import {fetchActivities} from '../actions/activity.js';
import {showSnackbar, displayNotification} from '../actions/app.js';

// import {getEventsDummy, getRemoteActivityDummy} from '../dummy.js';

const CORE_ACTIVITY = env.CORE_ACTIVITY;

export default class activityMain extends connect(store)(LitElement) {
    static get properties() {
        return {
            activityStatus: String,
            activityURL: String,
            realtimeActivities: Array,
            storedActivities: Array,
            active: Boolean,
            rooms: Array,
            listening: Boolean,
            notification: String,
            filterTypeSelection: Array,
            filterItemSelection: Array,
            selectedFilterType: String,
            selectedFilterItem: String,
            currentUser: Object,
            startDate: String,
            endDate: String,
        };
    }

    constructor() {
        super();
        this.activityURL = 'Not set';
        this.activityStatus = 'Not available';
        this.realtimeActivities = [];
        this.storedActivities = [];
        this.rooms = [];
        this.listening = false;
        this.filterTypeSelection = ['owner', 'room', 'device', 'date'];
        this.filterItemSelection = [];
        this.selectedFilterType = 'owner';
        this.selectedFilterItem = '';
        this.currentUser = {};
        this.startDate = '';
        this.endDate = '';
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.storedActivities = values(get(state, 'activity.activities')).map((data) => this.formatActivity(data));
        this.notification = get(state, 'app.notification');
        this.currentUser = get(state, 'app.currentUser');
    }

    _firstRendered() {}

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _didRender() {
        if (this.rooms.length > 0 && !this.listening) {
            const url = `${CORE_ACTIVITY}`;
            const socket = io(url, {
                path: '/activity',
                extraHeaders: {
                    'Access-Control-Allow-Credentials': 'omit',
                },
            });

            socket.on('connect', () => {
                this.activityStatus = 'Connected';
            });

            socket.on('disconnect', () => {
                this.activityStatus = 'Disconnected';
            });

            for (let room of this.rooms) {
                socket.on(room.id, (data) => {
                    data.room = room.name;
                    const activity = this.formatActivity(data);
                    displayNotification(activity);
                    this.realtimeActivities = [...this.realtimeActivities, activity];
                });
            }

            this.listening = true;
        }
    }

    formatActivity(data) {
        const date = new Date(+data.date);

        const type = data.command.indexOf('-') > -1 ? 'AC' : 'TV';
        const brand = type === 'AC' ? data.command.split('-')[0] : getTVBrandFromCodeset(data.command.substring(0, 4));
        let actionMessage = '';

        if (type === 'AC') {
            const codesetAC = data.command.split('-')[1];
            const codesetMode = codesetAC.substring(0, 1);
            const codesetFan = codesetAC.substring(1, 2);
            const codesetTemp = codesetAC.substring(2, 4);
            actionMessage = `set to ${fansAC[codesetFan].toLowerCase()} fan with ${modesAC[codesetMode].toLowerCase()} mode and ${codesetTemp}°C temperature`;
        } else if (type === 'TV') {
            const codesetTV = data.command.substring(4, 9);
            if (getTVCommandFromCodeset(codesetTV) != undefined) {
                actionMessage = `set to ${camelToSentence(getTVCommandFromCodeset(codesetTV))}`;
            }
        }

        const actionType = '';

        let room = this.rooms
            .map((obj) => {
                if (obj.id === data.room) {
                    return obj.name;
                } else {
                    return false;
                }
            })
            .filter((item) => item !== false)[0];

        room = room ? room : 'Unknown Room';

        const newActivity = {
            message: `${type} ${toTitleCase(brand)} ${actionMessage}`,
            event: actionType,
            room,
            date,
            source: data.source,
        };

        return newActivity;
    }

    addFrameRealtime(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.realtimeActivities, {data: newData, name: frame.name, dev_id: frame.dev_id}];
        this.realtimeActivities = frames;
    }

    addFrameStored(frame) {
        const newData = `data:frame/jpeg;base64, ${frame.data}`;
        const frames = [...this.storedActivities, {data: newData, frame: frame.name, dev_id: frame.dev_id}];
        this.storedActivities = frames;
    }

    getDateFromFilename(name) {
        return getDateFromFilename(name);
    }

    selectFilterType(type) {
        this.selectedFilterType = type;
        const startDate = this.shadowRoot.getElementById('start-date');
        const endDate = this.shadowRoot.getElementById('end-date');
        const filterType = this.shadowRoot.getElementById('filter-type-selection');
        const filterItem = this.shadowRoot.getElementById('filter-item-selection');
        startDate.value = null;
        endDate.value = null;
        startDate.style.display = 'none';
        endDate.style.display = 'none';
        filterType.style.marginRight = '5%';
        filterItem.style.display = 'block';
        if (type === 'owner') {
            const owner = this.currentUser.displayName;
            this.filterItemSelection = [owner];
            this.selectedFilterItem = owner;
            // this.startActivityFiltering();
        } else if (type === 'room') {
            const rooms = this.rooms.map((obj) => obj.name);
            this.filterItemSelection = rooms;
            this.selectedFilterItem = rooms[0];
            // this.startActivityFiltering();
        } else if (type === 'device') {
            const devices = concat(
                this.rooms
                    .map((obj) => {
                        return obj.devices.map((obj) => {
                            return obj.name;
                        });
                    })
                    .filter((item) => item !== undefined)
                    .reduce((item) => item)
            );

            this.filterItemSelection = devices;
            this.selectedFilterItem = devices[0];
            // this.startActivityFiltering();
        } else if (type === 'date') {
            startDate.style.display = 'block';
            endDate.style.display = 'block';
            filterItem.style.display = 'none';
            filterType.style.marginRight = '40px';
        }
        const itemSelected = this.shadowRoot.getElementById('item-selected');
        itemSelected.selected = null;
    }

    startActivityFiltering() {
        const type = this.selectedFilterType;

        if (type === 'owner') {
            const uid = this.currentUser.uid;
            store.dispatch(fetchActivities('owner', uid));
        } else if (type === 'room') {
            const roomId = this.rooms
                .map((obj) => {
                    const roomName = this.selectedFilterItem;
                    if (obj.name === roomName) {
                        return obj.id;
                    } else {
                        return false;
                    }
                })
                .filter((item) => item !== false)
                .reduce((item) => item);

            store.dispatch(fetchActivities('room', roomId));
        } else if (type === 'device') {
            const deviceId = this.selectedFilterItem;
            store.dispatch(fetchActivities('device', deviceId));
        } else if (type === 'date') {
            const startDate = new Date(`${this.startDate}`).getTime();
            const endDate = new Date(`${this.endDate}`).getTime();
            const date = {startDate: startDate, endDate: endDate};
            store.dispatch(fetchActivities('date', date));
        }

        store.dispatch(showSnackbar(`Activity filtered by ${this.selectedFilterType}`));
    }

    selectFilterItem(item) {
        this.selectedFilterItem = item;
        this.startActivityFiltering();
    }

    setStartDate(e) {
        this.startDate = e.target.value;
        if (this.startDate != '' && this.endDate != '') {
            this.startActivityFiltering();
        }
    }

    selectFilterDate(e) {
        this.endDate = e.target.value;
        if (this.startDate != '' && this.endDate != '') {
            this.startActivityFiltering();
        }
    }

    _render({filterTypeSelection, filterItemSelection, selectedFilterType, selectedFilterItem, startDate, endDate}) {
        const activityIcon = html`
                <svg class="time-icon time-icon-activity" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10.86 7c-.45-1.72-2-3-3.86-3-1.86 0-3.41 1.28-3.86 3H0v2h3.14c.45 1.72 2 3 3.86 3 1.86 0 3.41-1.28 3.86-3H14V7h-3.14zM7 10.2c-1.22 0-2.2-.98-2.2-2.2 0-1.22.98-2.2 2.2-2.2 1.22 0 2.2.98 2.2 2.2 0 1.22-.98 2.2-2.2 2.2z"></path>
                </svg>
            `;

        const eventsItems = (items) => {
            return items.map((item, index) => {
                const dateFromFilename = getDateFromFilename(item.name);
                const formattedDate = dayjs(dateFromFilename).format(' HH:mm:ss A DD MMM YYYY');
                return html`
                <div class="activity-group-title">
                    ${activityIcon}
                    Activity from ${item.dev_id} on ${formattedDate}
                </div>
                <paper-material class="activity-group" elevation="0">
                    <img src="${item.data}"></img>
                </paper-material>
            `;
            });
        };

        const data = [...this.realtimeActivities, ...this.storedActivities];

        function compare(a, b) {
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();

            if (dateA < dateB) return 1;
            if (dateA > dateB) return -1;
            return 0;
        }

        const sortedData = data.sort(compare);

        let activityItems = sortedData.map((item) => {
            const messageIcon = () => {
                switch (item.event) {
                    case 'increase_temp':
                        return html`<iron-icon icon="icons:icons:arrow-upward" />`;
                    case 'decrease_temp':
                        return html`<iron-icon icon="icons:icons:arrow-downward" />`;
                    case 'turn_on':
                        return html`<iron-icon icon="icons:power-settings-new" />`;
                    case 'turn_off':
                        return html`<iron-icon icon="icons:power-settings-new" />`;
                    case 'add_schedule':
                        return html`<iron-icon icon="icons:date-range" />`;
                    case 'remove_schedule':
                        return html`<iron-icon icon="icons:date-range" />`;
                }
            };

            const formattedDate = dayjs(item.date).format('HH:mm:ss DD MMM YYYY');

            return html`
                <div class="activity-group-title">
                    ${activityIcon}
                    <iron-icon icon="icons:schedule"></iron-icon>
                    ${formattedDate}
                </div>
                <paper-material class="activity-group">
                    <p>${messageIcon()} ${item.message}</p>
                    <p class="secondary">at ${item.room} source from ${item.source}</p>
                </paper-material>
            `;
        });

        const activityFilter = html`<div class="activities-filter">
            <paper-dropdown-menu label="Filter by" id="filter-type-selection" noink no-animations>
                <paper-listbox class="dropdown-content" slot="dropdown-content">
                    ${filterTypeSelection.map((type) => {
                        return html`
                                <paper-item on-tap="${() => this.selectFilterType(type)}">${toTitleCase(type)}</paper-item>
                            `;
                    })}
                </paper-listbox>
            </paper-dropdown-menu>
            <paper-dropdown-menu label="${toTitleCase(selectedFilterType)}" id="filter-item-selection" noink no-animations>
                <paper-listbox id="item-selected" class="dropdown-content" slot="dropdown-content">
                    ${filterItemSelection.map((item) => {
                        return html`
                                <paper-item on-tap="${() => this.selectFilterItem(item)}">${item}</paper-item>
                            `;
                    })}
                </paper-listbox>
            </paper-dropdown-menu>
            <paper-input id="start-date" label="Start date" type="date" name="date" max="${endDate}" on-change="${(e) => this.setStartDate(e)}"></paper-input>
            <paper-input id="end-date" label="End date" type="date" name="date" min="${startDate}" on-change="${(e) => this.selectFilterDate(e)}"></paper-input>
        </div>`;

        return html`
            <style>
                .event-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                img {
                    height: 300px;
                }

                .activities-filter {
                    margin: 0 1rem;
                    display: flex;
                    flex-flow: row wrap;
                }

                #filter-type-selection {
                    margin-right: 5%;
                }

                #filter-type-selection, #filter-item-selection {
                    width: 47.5%;
                }

                .activities-listing::before {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 14px;
                    z-index: -1;
                    display: block;
                    width: 2px;
                    content: "";
                    background-color: #eff1f3;
                }

                .activities-listing-padded {
                    padding-left: 39px;
                }

                .activities-listing {
                    position: relative;
                    padding-bottom: 20px;
                    margin-bottom: 15px;
                }

                .activity-group-title {
                    margin-top: 15px;
                    margin-left: -31px;
                    color: #586069;
                }

                .activity-group-title .time-icon-activity {
                    margin-right: 17px;
                    color: #c6cbd1;
                    background: #fafafa;
                }

                svg:not(:root) {
                    overflow: hidden;
                }

                .time-icon {
                    display: inline-block;
                    vertical-align: text-bottom;
                    fill: currentColor;
                }

                .test {
                    display: block;
                    height: 100px;
                }

                .container {
                    margin: 0 auto 4rem;
                    max-width: 680px;
                }

                paper-material {
                    display: block;
                    margin: 20px;
                    margin-left: 0;
                    padding: 15px;
                    background-color: white;
                    border-radius: 5px;
                }

                .activity-group {
                    margin-top: 10px;
                    list-style-type: none;
                }

                h4 {
                    margin-top: 0;
                    margin-bottom: 10px
                }

                p {
                    margin: 0;
                }

                p.secondary {
                    color: #6e6e6e;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                }

                .center-vh p {
                    position: relative;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .center-vh iron-icon {
                    margin-bottom: 1rem;
                    --iron-icon-fill-color: #5f6368;
                    --iron-icon-height: 48px;
                    --iron-icon-width: 48px;
                }

                #start-date {
                    width: 47%;
                    display: none;
                }

                #end-date {
                    width: 47%;
                    margin-left: 6%;
                    display: none;
                }
            </style>
            <div class="container">
                    ${activityFilter}
                    ${
                        data.length > 0
                            ? html`
                                <div class="activities-listing activities-listing-padded">${activityItems}</div>`
                            : html`
                                <div class="center-vh">
                                    <p>
                                        <iron-icon icon="icons:view-day"></iron-icon><br />
                                        No activity found
                                    </p>
                                </div>`
                    }
            </div>
    `;
    }
}

customElements.define('main-activity', activityMain);
