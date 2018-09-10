import {LitElement, html} from '@polymer/lit-element';

import '@polymer/paper-toggle-button';
import '@polymer/paper-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog';
import '@polymer/paper-radio-group';
import '@polymer/paper-radio-button';
import '@em-polymer/google-map/google-map';

import {store} from '../store.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {saveLocation} from '../actions/remote.js';
import {log} from '../utils.js';

// Import from lodash
const get = _.get;

export default class Location extends connect(store)(LitElement) {
    static get properties() {
        return {
            active: Boolean,
            location: Array,
            address: String,
            zoom: Number,
            remotes: Array,
            selectedRemote: String,
            onePushButtons: Array,
            commandIn: String,
            commandOut: String,
            codeset: String,
            room: Object,
        };
    }

    constructor() {
        super();
        this.currentUser = {};
        this.zoom = 10;
        this.remotes = [];
        this.selectedRemote = '';
        this.onePushButtons = ['ON', 'OFF'];
        this.commandIn = '';
        this.commandOut = '';
        this.roomID = '';
        this.rendered = false;
        this.room = {};
    }

    _didRender() {
        this.googleMap();
        if (this.location.lat == undefined) {
            this.address = '';
        } else {
            this.geocodeLatLng(this.location.lat + ',' + this.location.lng);
        }

        const locationEmpty = this.location.lat == undefined;
        const resetElement = this.shadowRoot.getElementById(`reset-button-${this.room.index}`);
        const geoInElement = this.shadowRoot.getElementById(`geo-in-${this.room.index}`);
        const geoOutElement = this.shadowRoot.getElementById(`geo-out-${this.room.index}`);
        if (locationEmpty) {
            resetElement.setAttribute('disabled', true);
            geoInElement.setAttribute('disabled', true);
            geoOutElement.setAttribute('disabled', true);
        } else {
            resetElement.removeAttribute('disabled');
        }
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        let stateRemotes = get(state, 'remote.activeRoom.remotes') || [];
        stateRemotes = stateRemotes.map((remote) => {
            const name = get(remote, 'name');
            const nameUpperCased = name.toUpperCase();
            return nameUpperCased;
        });
        this.remotes = stateRemotes;
        this.room = get(state, 'remote.activeRoom');
        const roomIndex = get(state, 'remote.activeRoom.index');
        const lat = get(state, `remote.rooms[${roomIndex}].home.latitude`);
        const lng = get(state, `remote.rooms[${roomIndex}].home.longitude`);
        if (lat == undefined) {
            this.location = {lat: lat, lng: lng};
        } else {
            this.location = {lat: +lat, lng: +lng};
        }
    }

    googleMap() {
        const mapElement = this.shadowRoot.getElementById('map');
        let center;
        let pos;
        let mapZoom = this.zoom;
        if (this.location.lat == undefined) {
            center = {lat: -6.3627638, lng: 106.8270482};
            pos = null;
        } else {
            center = this.location;
            pos = center;
        }

        const mapOptions = {
            zoom: mapZoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // center: new google.maps.LatLng(-6.3627638, 106.8270482),
            center: center,
        };

        const map = new google.maps.Map(mapElement, mapOptions);
        const geocoder = new google.maps.Geocoder();

        const marker = new google.maps.Marker({
            draggable: true,
            map: map,
            position: pos,
        });

        marker.addListener('dragend', () => {
            this.zoom = map.getZoom();
            const location = marker.getPosition();
            this.location = {lat: location.lat(), lng: location.lng()};
            const latlng = this.location.lat + ',' + this.location.lng;
            this.geocodeLatLng(latlng);
            // store.dispatch(reverseGeocode(latlng));
        });
        const inputSearch = this.shadowRoot.getElementById('address');
        const search = new google.maps.places.SearchBox(inputSearch);
        // this.searchBox(map, geocoder);
    }

    geocode(address) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({address: address}, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                this.location = {lat: location.lat(), lng: location.lng()};
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    geocodeLatLng(input) {
        const geocoder = new google.maps.Geocoder();
        const latlngStr = input.split(',', 2);
        const latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        geocoder.geocode({location: latlng}, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    this.address = results[0].formatted_address;
                } else {
                    window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });
    }

    searchBox(map, geocoder) {
        // Create the search box and link it to the UI element.
        const input = this.shadowRoot.getElementById('pac-input');
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', () => {
            searchBox.setBounds(map.getBounds());
        });

        let markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', () => {
            this.geocodeAddress(geocoder, map);
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach((marker) => {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach((place) => {
                if (!place.geometry) {
                    log('Returned place contains no geometry');
                    return;
                }
                const icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                };

                // Create a marker for each place.
                markers.push(
                    new google.maps.Marker({
                        map: map,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location,
                    })
                );

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                log(place.geometry.location.lat());
                log(place.geometry.location.lng());
            });
            map.fitBounds(bounds);
            log(input.value);
        });
    }

    geocodeAddress(geocoder, resultsMap) {
        const address = this.shadowRoot.getElementById('pac-input').value;
        geocoder.geocode({address: address}, (results, status) => {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                const marker = new google.maps.Marker({
                    draggable: true,
                    map: resultsMap,
                    zoom: 16,
                    position: results[0].geometry.location,
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    getIndexOf(array, element) {
        return array.indexOf(element);
    }

    setSelectedRemote(remote) {
        this.selectedRemote = remote;
    }

    setSelectedPushButton(button) {
        this.selectedPushButton = button;
    }

    setCommandIn(element) {
        this.commandIn = this.selectedRemote + ' ' + this.selectedPushButton;
        const listboxButton = element.getElementById('listbox-button-in');
        const listboxRemote = element.getElementById('listbox-remote-in');
        listboxButton.selected = null;
        listboxRemote.selected = null;
    }

    setCommandOut(element) {
        this.commandOut = this.selectedRemote + ' ' + this.selectedPushButton;
        const listboxButton = element.getElementById('listbox-button-out');
        const listboxRemote = element.getElementById('listbox-remote-out');
        listboxButton.selected = null;
        listboxRemote.selected = null;
    }

    setRemoteCode(remote) {
        const list = remote.split(' ');
        const remoteType = list[0].toLowerCase();
        const brand = list[1].toLowerCase();
        const command = list[2].toLowerCase();

        let codeBrand = '';
        let codeCommand = '';
        if (remoteType == 'tv') {
            if (brand == 'lg') codeBrand = '1970';
            else if (brand == 'samsung') codeBrand = '0595';
            else if (brand == 'panasonic') codeBrand = '2619';
            else if (brand == 'sony') codeBrand = '1319';
            else if (brand == 'sharp') codeBrand = 'T001';
            // 1429
            else if (brand == 'changhong') codeBrand = '2903';
            else if (brand == 'sanyo') codeBrand = '1430';
            else if (brand == 'toshiba') codeBrand = '0339';
            if (command == 'on') codeCommand = '15';
            else if (command == 'off') codeCommand = '16';
            this.codeset = codeBrand + codeCommand;
        } else if (remoteType == 'ac') {
            if (command == 'on') codeCommand = '1018';
            else if (command == 'off') codeCommand = '0000';
            this.codeset = brand + '-' + codeCommand;
        }
    }

    getLocation(roomIndex) {
        const address = this.shadowRoot.getElementById('address').value;
        const geoInElement = this.shadowRoot.getElementById(`geo-in-${roomIndex}`);
        const geoOutElement = this.shadowRoot.getElementById(`geo-out-${roomIndex}`);
        this.address = address;
        this.geocode(address);
        // store.dispatch(getLocation(address));
        this.zoom = 15;
        this.shadowRoot.getElementById('address').value = null;
        geoInElement.removeAttribute('disabled');
        geoOutElement.removeAttribute('disabled');
    }

    saveLocation() {
        let codesetInRange = '';
        let codesetOutRange = '';
        if (this.commandIn != '') {
            this.setRemoteCode(this.commandIn);
            codesetInRange = this.codeset;
        }

        if (this.commandOut != '') {
            this.setRemoteCode(this.commandOut);
            codesetOutRange = this.codeset;
        }

        const location = {
            roomID: this.room.id,
            geosenseInRange: codesetInRange,
            geosenseOutRange: codesetOutRange,
            lat: this.location.lat,
            long: this.location.lng,
        };

        store.dispatch(saveLocation(location));
        this.commandIn = '';
        this.commandOut = '';
    }

    resetLocation() {
        log('reset');
    }

    _render({room, location, address, remotes, onePushButtons, commandIn, commandOut}) {
        return html`
            <style>
                .container {
                    margin: 0 auto;
                    max-width: 680px;
                    padding: 0 0.8rem 5rem;
                }
                /* google map with searchbox style */
                #description {
                    font-family: Roboto;
                    font-size: 15px;
                    font-weight: 300;
                }

                #infowindow-content .title {
                    font-weight: bold;
                }

                #infowindow-content {
                    display: none;
                }

                #map #infowindow-content {
                    display: inline;
                }

                .pac-card {
                    margin: 10px 10px 0 0;
                    border-radius: 2px 0 0 2px;
                    box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    outline: none;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    background-color: #fff;
                    font-family: Roboto;
                }

                #pac-container {
                    padding-bottom: 12px;
                    margin-right: 12px;
                }

                .pac-controls {
                    display: inline-block;
                    padding: 5px 11px;
                }

                .pac-controls label {
                    font-family: Roboto;
                    font-size: 13px;
                    font-weight: 300;
                }

                #pac-input {
                    background-color: #fff;
                    font-family: Roboto;
                    font-size: 15px;
                    font-weight: 300;
                    margin-left: 12px;
                    padding: 0 11px 0 13px;
                    text-overflow: ellipsis;
                    width: 400px;
                }

                #pac-input:focus {
                    border-color: #4d90fe;
                }

                #title {
                    color: #fff;
                    background-color: #4d90fe;
                    font-size: 25px;
                    font-weight: 500;
                    padding: 6px 12px;
                }
                #target {
                    width: 345px;
                }
                /* end style */

                .text-container {
                    width: 100%;
                }

                .left {
                    float: left;
                }

                .right {
                    float: right;
                }

                .light {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }

                paper-input {
                    width: 100%;
                }
                #mapid { height: 180px; }

                #dropdownType {
                    width: 21%;
                    margin-right: 10px;
                }

                #dropdownBrand {
                    width: 75%;
                }

                #dropdownPushButton {
                    width: 100%;
                }

                .command-right {
                    margin-left: auto;
                    margin-right: 0;
                    position: absolute;
                    right: 20px;
                }

                .pointer {
                    cursor: pointer;
                }

                paper-material.paper-container {
                    position: relative;
                    display: block;
                    border-radius: 5px;
                    background-color: white;
                    margin: 1rem 0;
                    padding-bottom: 1rem;
                    background-color: white;
                }

                paper-item {
                    border-top: 1px solid #0000000f;
                }

                .geolocation-buttons {
                    margin: 1rem;
                    display: flex;
                    flex-flow: row wrap;
                }

                .save-button {
                    margin-right: 4%;
                }

                .save-button, .reset-button {
                    width: 47.5%;
                }
            </style>
            <div align="left" id="map" style="width: 100%; height: 300px;"></div>
            <div class="container">
                <paper-material class="paper-container">
                    <div role="listbox" class="settings">
                        <paper-item>
                            <paper-input
                                id="address"
                                label="Address"
                                placeholder="Search Address"
                                always-float-label>
                            </paper-input>
                            <mwc-button
                                icon="search"
                                label="search"
                                on-click="${() => this.getLocation(room.index)}"
                            ></mwc-button>
                        </paper-item>
                        <paper-item>
                            <paper-item-body class="text-container">
                                <p class="left">Address</p>
                                <p class="right">${address}</p>
                            </paper-item-body>
                        </paper-item>
                        <paper-item class="pointer">
                            <paper-item-body class="text-container">
                                <p class="left">Action in range</p>
                            </paper-item-body>
                            <div class="command-right">
                                ${
                                    commandIn == ''
                                        ? html`
                                        <mwc-button
                                            id="geo-in-${room.index}"
                                            class="mwc-edit"
                                            label="Edit"
                                            icon="edit"
                                            on-click="${() => this.shadowRoot.getElementById('geoInDialog').open()}">
                                        </mwc-button>`
                                        : html`
                                        ${commandIn}`
                                }
                            </div>
                        </paper-item>
                        <paper-item class="pointer">
                            <paper-item-body class="text-container">
                                <p class="left">Action out range</p>
                            </paper-item-body>
                            <div class="command-right">
                            ${
                                commandOut == ''
                                    ? html`
                                        <mwc-button
                                            id="geo-out-${room.index}"
                                            class="mwc-edit"
                                            label="Edit"
                                            icon="edit"
                                            on-click="${() => this.shadowRoot.getElementById('geoOutDialog').open()}">
                                        </mwc-button>`
                                    : html`
                                        ${commandOut}`
                            }
                            </div>
                        </paper-item>
                        <div class="geolocation-buttons">
                            <mwc-button
                                raised
                                id="save-button-${room.index}"
                                class="light save-button"
                                label="save"
                                on-click="${() => this.saveLocation()}"
                            ></mwc-button>
                            <mwc-button
                                id="reset-button-${room.index}"
                                class="reset-button"
                                label="reset"
                                on-click="${() => this.resetLocation()}"
                            ></mwc-button>
                        </div>
                    </div>
                </paper-material>
            </div>
            <paper-dialog id="geoInDialog" with-backdrop>
                <div class="horizontal layout">
                    <paper-dropdown-menu id="dropdownPushButton" label="Remote" noink no-animations>
                        <paper-listbox id="listbox-remote-in" slot="dropdown-content" class="dropdown-content">
                            ${remotes.map(
                                (item) => html`
                                    <paper-item on-click="${() => this.setSelectedRemote(item)}" item-name="${this.getIndexOf(remotes, item)}">
                                        ${item}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu id="dropdownPushButton" label="Command" noink no-animations>
                        <paper-listbox id="listbox-button-in" slot="dropdown-content" class="dropdown-content">
                            ${onePushButtons.map(
                                (item) => html`
                                    <paper-item on-click="${() => this.setSelectedPushButton(item)}">
                                        ${item}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div class="buttons">
                    <mwc-button on-click="${() => this.setCommandIn(this.shadowRoot)}" dialog-confirm label="Add This Setting"></mwc-button>
                </div>
            </paper-dialog>
            <paper-dialog id="geoOutDialog" with-backdrop>
                <div class="horizontal layout">
                    <paper-dropdown-menu id="dropdownPushButton" label="Remote" noink no-animations>
                        <paper-listbox id="listbox-remote-out" slot="dropdown-content" class="dropdown-content">
                            ${remotes.map(
                                (item) => html`
                                    <paper-item on-click="${() => this.setSelectedRemote(item)}" item-name="${this.getIndexOf(remotes, item)}">
                                        ${item}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-dropdown-menu id="dropdownPushButton" label="Command" noink no-animations>
                        <paper-listbox id="listbox-button-out" slot="dropdown-content" class="dropdown-content">
                            ${onePushButtons.map(
                                (item) => html`
                                    <paper-item on-click="${() => this.setSelectedPushButton(item)}">
                                        ${item}
                                    </paper-item>
                                `
                            )}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div class="buttons">
                    <mwc-button on-click="${() => this.setCommandOut(this.shadowRoot)}" dialog-confirm label="Add This Setting"></mwc-button>
                </div>
            </paper-dialog>
        `;
    }
}

customElements.define('room-location', Location);
