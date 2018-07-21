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
import {getLocation} from '../actions/remote.js';
import {env} from '../configs';

// Import from lodash
const get = _.get;

export default class Location extends connect(store)(LitElement) {
    static get properties() {
        return {
            active: Boolean,
            location: Array,
            address: String,
        };
    }

    constructor() {
        super();
        this.currentUser = {};
        this.location = [-6.3627638, 106.8270482];
        this.rendered = false;
    }

    _didRender() {
        const mapElement = this.shadowRoot.getElementById('map');

        mapboxgl.accessToken = env.MAPBOX;
        const map = new mapboxgl.Map({
            container: mapElement,
            style: 'mapbox://styles/mapbox/streets-v10',
            center: this.location,
            zoom: 12,
        });

        /*
        const marker = new mapboxgl.Marker({
            draggable: true,
        })
            .setLngLat([0, 0])
            .addTo(map);

        const onDragEnd = () => {
            this.location = marker.getLngLat();
        };

        marker.on('dragend', onDragEnd);
        */
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.location = get(state, 'remote.location.results[0].geometry.location');
    }

    getLocation(element) {
        const address = element.getElementById('address').value;
        store.dispatch(getLocation(address));
        this.address = address;
        element.getElementById('address').value = null;
    }

    _render({location, address}) {
        return html`
            <style>
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
            </style>
            <div role="listbox" class="settings">
            <div id='map' style='width: 100%; height: 300px;'></div>
                <paper-item>
                    <paper-input
                        id="address"
                        label="Address"
                        always-float-label>
                    </paper-input>
                </paper-item>
                <paper-item>
                    <mwc-button
                        raised
                        class="light"
                        label="geocode"
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
            </div>
            <!-- <google-map fit-to-markers api-key="AIzaSyCfGVFRrYf89QiMaQCiXUb-D_uDjUPCsCc">
                <google-map-marker latitude="37.78" longitude="-122.4" draggable="true"></google-map-marker>
            </google-map> -->
    `;
    }
}

customElements.define('add-location', Location);
