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
import {getLocation, reverseGeocode, saveLocation, setLocation} from '../actions/remote.js';
import {env} from '../configs';

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
            roomID: String,
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
    }

    _didRender() {
        this.googleMap();
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
        this.roomID = get(state, 'remote.activeRoom.id');
    }

    mapbox() {
        const mapElement = this.shadowRoot.getElementById('map');
        let loc;
        let mapZoom = this.zoom;

        if (this.location == undefined) {
            loc = [106.8270482, -6.3627638];
        } else {
            loc = this.location;
        }

        mapboxgl.accessToken = env.MAPBOX;
        const map = new mapboxgl.Map({
            container: mapElement,
            style: 'mapbox://styles/mapbox/streets-v10',
            center: loc,
            zoom: mapZoom,
        });

        const marker = new mapboxgl.Marker({
            draggable: true,
        })
            .setLngLat(loc)
            .addTo(map);

        const onDragEnd = () => {
            this.zoom = map.getZoom();
            this.location = marker.getLngLat();
            const latlng = this.location.lat + ',' + this.location.lng;
            store.dispatch(reverseGeocode(latlng));
        };

        marker.on('dragend', onDragEnd);
    }

    googleMap() {
        const mapElement = this.shadowRoot.getElementById('map');
        let center;
        let pos;
        let mapZoom = this.zoom;
        if (this.location == undefined) {
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
            this.geocodeLatLng(geocoder, map, latlng);
            // store.dispatch(reverseGeocode(latlng));
        });
        const inputSearch = this.shadowRoot.getElementById('address');
        const search = new google.maps.places.SearchBox(inputSearch);
        // this.searchBox(map, geocoder);
    }

    geocode(address) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                this.location = {lat: location.lat(), lng: location.lng()};
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    geocodeLatLng(geocoder, map, input) {
        const latlngStr = input.split(',', 2);
        const latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        geocoder.geocode({'location': latlng}, (results, status) => {
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
                    console.log("Returned place contains no geometry");
                    return;
                }
                const icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                console.log(place.geometry.location.lat());
                console.log(place.geometry.location.lng());
            });
            map.fitBounds(bounds);
            console.log(input.value);
        });
    }

    geocodeAddress(geocoder, resultsMap) {
        const address = this.shadowRoot.getElementById('pac-input').value;
        geocoder.geocode({'address': address}, (results, status) => {
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
            else if (brand == 'sharp') codeBrand = 'T001'; // 1429
            else if (brand == 'changhong') codeBrand = '2903';
            else if (brand == 'sanyo') codeBrand = '1430';
            else if (brand == 'toshiba') codeBrand = '0339';
            if(command == 'on') codeCommand ='15';
            else if(command == 'off') codeCommand = '16';
            this.codeset = codeBrand + codeCommand;
        } else if (remoteType == 'ac') {
            if(command == 'on') codeCommand = '1018';
            else if(command == 'off') codeCommand = '0000';
            this.codeset = brand + '-' + codeCommand;
        }
    }

    getLocation(element) {
        const address = element.getElementById('address').value;
        this.address = address;
        this.geocode(address);
        // store.dispatch(getLocation(address));
        this.zoom = 15;
        element.getElementById('address').value = null;
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
        store.dispatch(saveLocation(this.roomID, codesetInRange, codesetOutRange, this.location));
        this.commandIn = '';
        this.commandOut = '';
    }

    _render({location, address, remotes, onePushButtons, commandIn, commandOut}) {
        return html`
            <style>
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

                .settings {
                    padding-bottom: 70px;
                }

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
            </style>
            <!-- <input id="pac-input" class="controls" type="text" placeholder="Search Address"> -->
            <div align="left" id="map" style="width: 100%; height: 400px;"></div>
            <!-- <div id='map' style='width: 100%; height: 300px;'></div> -->
            <div role="listbox" class="settings">
                <paper-item>
                    <paper-input
                        id="address"
                        label="Address"
                        placeholder="Search Address"
                        always-float-label>
                    </paper-input>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="search"
                        on-click="${() => this.getLocation(this.shadowRoot)}"
                    ></mwc-button>
                </paper-item>
                <paper-item>
                    <paper-item-body class="text-container">
                        <p class="left">Address</p>
                        <p class="right">${address}</p>
                    </paper-item-body>
                </paper-item>
                <paper-item>
                    <paper-item-body class="text-container">
                        <p class="left">Latitude</p>
                        <p class="right">${get(location, 'lat')}</p>
                    </paper-item-body>
                </paper-item>
                <paper-item>
                    <paper-item-body class="text-container">
                        <p class="left">Longitude</p>
                        <p class="right">${get(location, 'lng')}</p>
                    </paper-item-body>
                </paper-item>
                <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('geoInDialog').open()}">
                    <paper-item-body class="text-container">
                        <p class="left">Geosense in range</p>
                    </paper-item-body>
                    <div class="command-right">
                        ${commandIn}
                    </div>
                </paper-item>
                <paper-item class="pointer" on-click="${() => this.shadowRoot.getElementById('geoOutDialog').open()}">
                    <paper-item-body class="text-container">
                        <p class="left">Geosense out range</p>
                    </paper-item-body>
                    <div class="command-right">
                        ${commandOut}
                    </div>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="save location"
                        on-click="${() => this.saveLocation()}"
                    ></mwc-button>
                </paper-item>
            </div>
            <paper-dialog id="geoInDialog">
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
            <paper-dialog id="geoOutDialog">
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
            </paper-dialog
        `;
    }
}

customElements.define('add-location', Location);
