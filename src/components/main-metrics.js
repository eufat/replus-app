import {LitElement, html} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';

import {toTitleCase} from '../utils.js';
import {store} from '../store.js';

const get = _.get;
const values = _.values;
const mapValues = _.mapValues;

export default class MainMetrics extends connect(store)(LitElement) {
    static get properties() {
        return {
            rooms: Array,
            uid: String,
            active: Boolean,
        };
    }

    constructor() {
        super();
        this.rooms = [];
        this.newDevice = {};
        this.newRemote = {};
    }

    _didRender() {
        this._setButton();
        this.googleChart();
    }

    _shouldRender(props, changedProps, old) {
        return props.active;
    }

    _stateChanged(state) {
        this.rooms = get(state, 'remote.rooms');
        this.uid = get(state, 'app.currentUser.uid');
    }

    googleChart() {
        const rooms = _.values(this.rooms);
        rooms.map((room, roomIndex) => {
            const remotes = _.values(room.remotes);
            remotes.map((remote, remoteIndex) => {
                if (remote.name.substring(0, 2) == 'tv') {
                    this.barChart(remote, roomIndex, remoteIndex);
                } else {
                    this.lineChart(remote, roomIndex, remoteIndex);
                }
            });
        });
    }

    barChart(remote, roomIndex, remoteIndex) {
        google.charts.load('current', {packages: ['corechart', 'bar']});
        google.charts.setOnLoadCallback(drawChart);
        const chartElement = this.shadowRoot.getElementById(`chart-${roomIndex}${remoteIndex}`);

        function drawChart() {
            // Define the chart to be drawn.
            const data = new google.visualization.DataTable();
            data.addColumn('timeofday', 'Time of Day');
            data.addColumn('number', 'Power');

            data.addRows([
                [{v: [8, 0, 0], f: '8 am'}, 1], // v: value, f: format as
                [{v: [9, 0, 0], f: '9 am'}, 2],
                [{v: [10, 0, 0], f: '10 am'}, 3],
                [{v: [11, 0, 0], f: '11 am'}, 4],
                [{v: [12, 0, 0], f: '12 pm'}, 5],
                [{v: [13, 0, 0], f: '1 pm'}, 6],
                [{v: [14, 0, 0], f: '2 pm'}, 7],
                [{v: [15, 0, 0], f: '3 pm'}, 8],
                [{v: [16, 0, 0], f: '4 pm'}, 9],
                [{v: [17, 0, 0], f: '5 pm'}, 10],
            ]);

            // Set chart options
            const options = {
                title: `${toTitleCase(remote.name)}`,
                hAxis: {
                    title: 'Time of Day',
                    format: 'h:mm a',
                    viewWindow: {
                        min: [7, 30, 0],
                        max: [17, 30, 0]
                    }
                },
                vAxis: {
                    title: 'Rating (scale of 1-10)'
                },
                legend: 'none',
            };

            // Instantiate and draw the chart.
            const chart = new google.visualization.ColumnChart(chartElement);
            chart.draw(data, options);
        }
    }

    lineChart(remote, roomIndex, remoteIndex) {
        google.charts.load('current', {packages: ['corechart', 'line']});
        google.charts.setOnLoadCallback(drawChart);
        const chartElement = this.shadowRoot.getElementById(`chart-${roomIndex}${remoteIndex}`);

        function drawChart() {
            const data = new google.visualization.DataTable();
            data.addColumn('number', 'Day');
            data.addColumn('number', 'Power');

            data.addRows([
                [{v: 1, f: 'Day 1'}, 1.1],
                [{v: 2, f: 'Day 2'}, 3.2],
                [{v: 3, f: 'Day 3'}, 2.9],
                [{v: 4, f: 'Day 4'}, 8.2],
                [{v: 5, f: 'Day 5'}, 5.3],
                [{v: 6, f: 'Day 6'}, 2.6],
                [{v: 7, f: 'Day 7'}, 7.7],
            ]);

            // Set chart options
            const options = {
                title: `${toTitleCase(remote.name)}`,
                hAxis: {
                    title: 'Day',
                },
                vAxis: {
                    title: 'Rating (scale of 1-10)',
                },
                legend: 'none',
            };

            // Instantiate and draw the chart.
            const chart = new google.visualization.LineChart(chartElement);
            chart.draw(data, options);
        }
    }

    _setButton() {
        const rooms = _.values(this.rooms);
        rooms.map((item, index) => {
            const nextButton = this.shadowRoot.getElementById(`next-slide-${index}`);
            const prevButton = this.shadowRoot.getElementById(`prev-slide-${index}`);
            const remotes = this.shadowRoot.getElementById(`remotes-${index}`);
            let hasHorizontalScrollbar;

            if (nextButton != null || prevButton != null) {
                if (item.onEdit == true) {
                    nextButton.style.top = '230px';
                    prevButton.style.top = '230px';
                } else {
                    nextButton.style.top = '150px';
                    prevButton.style.top = '150px';
                }
            }

            if (remotes != null) {
                hasHorizontalScrollbar = remotes.scrollWidth > remotes.clientWidth;
            }

            if (nextButton != undefined) {
                if (hasHorizontalScrollbar) {
                    const maxScrollLeft = remotes.scrollWidth - remotes.clientWidth;
                    nextButton.style.display = 'block';
                    if (remotes.scrollLeft == maxScrollLeft) {
                        nextButton.style.display = 'none';
                    }
                } else {
                    nextButton.style.display = 'none';
                    prevButton.style.display = 'none';
                }
            }
        });
    }

    _scrollLeft(roomIndex, button) {
        const remotes = this.shadowRoot.getElementById(`remotes-${roomIndex}`);
        const remoteItem = this.shadowRoot.getElementById(`remote-${roomIndex}0`);
        const remoteWidth = remoteItem.offsetWidth;
        if (button == 'right') {
            remotes.scrollLeft += remoteWidth + 11;
        } else if (button == 'left') {
            remotes.scrollLeft -= remoteWidth + 11;
        }
    }

    _scroll(e, roomIndex) {
        const remote = e.target;
        const maxScrollLeft = remote.scrollWidth - remote.clientWidth;
        const nextButton = this.shadowRoot.getElementById(`next-slide-${roomIndex}`);
        const prevButton = this.shadowRoot.getElementById(`prev-slide-${roomIndex}`);
        if (remote.scrollLeft == maxScrollLeft) {
            nextButton.style.display = 'none';
        } else if (remote.scrollLeft == 0) {
            prevButton.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
        }
    }

    _render({rooms}) {
        const roomRemotes = (remotes, roomIndex) => {
            return mapValues(remotes, (remote) => {
                return html`
                    <div id="remote-${roomIndex}${remotes.indexOf(remote)}" class="remote-item" style="height: 265px;">
                        <div id="chart-${roomIndex}${remotes.indexOf(remote)}"></div>
                        <div class="statistics">
                            <div class="row">
                                <div class="column">
                                    <p class="title">Used time</p>
                                    <p class="total">5 hours</p>
                                </div>
                                <div class="column">
                                    <p class="title">Avg power used</p>
                                    <p class="total">1000</p>
                                </div>
                                <div class="column">
                                    <p class="title">Max power used</p>
                                    <p class="total">5000</p>
                                </div>
                            </div>
                        </div>
                    </div>`
            });
        };

        const roomsValues = values(rooms);
        const roomsItems = roomsValues.map((item, roomIndex) => {
            return html`
                <style>
                    paper-fab {
                        margin: 5px;
                        color: #2B5788;
                        --paper-fab-background: white;
                        --paper-fab-keyboard-focus-background: white;
                    }
                    #slides {
                        width: auto;
                    }
                    [id|=next-slide], [id|=prev-slide] {
                        position: absolute;
                        top: 110px;
                    }
                    .next {
                        right: 0 !important;
                        display: none;
                    }
                    .prev {
                        left: 0 !important;
                        display: none;
                    }
                </style>
                <paper-material id="material-${roomIndex}" elevation="1">
                    <div class="room-title">
                        <h1>${item.name}</h1>
                    </div>
                    <div id="remotes-${roomIndex}" class="room-remotes" on-scroll="${(e) => this._scroll(e, roomIndex)}">
                        ${values(roomRemotes(item.remotes, roomIndex))}
                        <div id="slides">
                            <paper-fab id="prev-slide-${roomIndex}" class="prev" mini icon="image:navigate-before" on-click="${(e) => this._scrollLeft(roomIndex, 'left')}"></paper-fab>
                            <paper-fab id="next-slide-${roomIndex}" class="next" mini icon="image:navigate-next" on-click="${(e) => this._scrollLeft(roomIndex, 'right')}"></paper-fab>
                        </div>
                    </div>
                </paper-material>
            `;
        });

        return html`
            <style>
                img {
                    user-drag: none;
                    user-select: none;
                    -moz-user-select: none;
                    -webkit-user-drag: none;
                    -webkit-user-select: none;
                    -ms-user-select: none;
                }

                #container {
                    display: block;
                    margin: 100px;
                }

                .room-title {
                    padding-bottom: 10px;
                }

                .room-title paper-button {
                    display: inline-block;
                }

                .room-title h1 {
                    display: inline-block;
                    font-weight: normal;
                    font-size: 1.2rem;
                    margin-bottom: 0px !important;
                    margin-top: 0px !important;
                }

                .top-button {
                    margin: 0.5rem 0;
                }

                /* .room-remotes { */
                [id|=remotes] {
                    width: 100%;
                    display: block;
                    overflow: auto;
                    white-space: nowrap;
                }

                @media screen and (max-width: 425px) {
                    .title {
                        font-size: 3vw !important;
                    }
                }

                /* @media screen and (max-width: 375px) {
                    .remote-item {
                        width: 42% !important;
                        height: 120px !important;
                    }
                }

                @media screen and (max-width: 320px) {
                    .remote-item {
                        width: 115px !important;
                        height: 120px !important;
                    }
                } */

                .remote-item {
                    text-align: center;
                    display: inline-block;
                    vertical-align: top;
                    padding: 10px;
                    width: 97%;
                    padding: 5px;
                    margin-right: 0.5rem;
                    border-radius: 10px;
                    border: 1px solid #0000000f;
                }

                .remote-item p {
                    margin: 0;
                }

                h2 {
                    margin: 0;
                    font-size: 1.25em;
                }

                .paper-container {
                    margin: 0 auto;
                    max-width: 680px;
                    padding: 0 0.8rem 5rem;
                }

                paper-material {
                    position: relative;
                    display: block;
                    margin: 1rem 0;
                    padding: 1rem;
                    border-radius: 5px;
                    background-color: white;
                }

                .center-vh {
                    width: 100%;
                    height: 80vh;
                    text-align: center;
                    line-height: 80vh;
                }

                .light-button {
                    --mdc-theme-on-primary: black;
                    --mdc-theme-primary: white;
                    --mdc-theme-on-secondary: black;
                    --mdc-theme-secondary: white;
                }

                .blue-button {
                    --mdc-theme-on-primary: white;
                    --mdc-theme-primary: #4664ae;
                    --mdc-theme-on-secondary: white;
                    --mdc-theme-secondary: #4664ae;
                }

                .wide {
                    width: 100%;
                    margin: 1rem 0 0 !important;
                }

                /* Create three equal columns that floats next to each other */
                .column {
                    float: left;
                    width: 33.33%;
                }

                /* Clear floats after the columns */
                .row:after {
                    content: "";
                    display: table;
                    clear: both;
                }

                .column p {
                    text-align: center;
                }

                .total {
                    font-size: 1.25rem;
                    margin-bottom: 0px !important;
                }

                .title {
                    margin-top: 0px !important;
                }

                .statistics {
                    padding-top: 10px;
                    padding-bottom: 10px;
                }

                [id|=chart] {
                    margin-left: 25px;
                }
            </style>
            <div class="rooms-container">
                <div class="paper-container">
                    ${roomsItems}
                </div>
            </div>
    `;
    }
}

customElements.define('main-metrics', MainMetrics);
