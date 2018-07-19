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
        this.location = [];
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.location = get(state, 'remote.location.results[0].geometry.location');
    }

    // _didRender() {
    //     let user = firebase.auth().currentUser;

    //     if (user != null) {
    //         user.providerData.forEach((profile) => {
    //             this.provider = profile.providerId;
    //         });
    //     }
    // }

    initMap() {
        const map = new google.maps.Map(this.shadowRoot.getElementById('map'), {
            zoom: 8,
            center: {lat: -34.397, lng: 150.644}
        });
        const geocoder = new google.maps.Geocoder();

        this.shadowRoot.getElementById('submit').addEventListener('click', function() {
            geocodeAddress(geocoder, map);
        });
    }

    geocodeAddress(geocoder, resultsMap) {
        const address = this.shadowRoot.getElementById('address').value;
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                resultsMap.setCenter(results[0].geometry.location);
                const marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location,
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    getLocation(element) {
        const address = element.getElementById('address').value;
        store.dispatch(getLocation(address));
        this.address = address;
        element.getElementById('address').value = null;
    }

    _render({location, address}) {
        // const tag = document.createElement('script');
        // tag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCfGVFRrYf89QiMaQCiXUb-D_uDjUPCsCc&callback=initMap';
        // tag.defer = true;
        // const firstScriptTag = document.getElementsByTagName('script')[0];
        // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
            </style>
            <div role="listbox" class="settings">
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
