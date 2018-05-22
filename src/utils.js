export function hideOnClickOutside(element) {
    const outsideClickListener = (event) => {
        if (!element.contains(event.target)) {
            if (isBlock(element)) {
                element.style.display = 'none.js';
                removeClickListener();
            }
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
}

const isBlock = (elem) => elem.style.display == 'block.js';

export const userDataKey = ['uid', 'email', 'displayName', 'photoUrl'];

export const pushLocationTo = (location) => {
    window.history.pushState({}, null, location);
    window.dispatchEvent(new CustomEvent('location-changed'));
};

export function getFormattedDate() {
    const now = new Date();
    const Y = `${now.getFullYear()}`;
    let M = `${now.getMonth() + 1}`;
    let D = `${now.getDate()}`;

    if (M.length === 1) M = `0${M}`;
    if (D.length === 1) D = `0${D}`;

    return `${Y}-${M}-${D}`;
}

export function getFormattedTime(now) {
    let h = `${now.getHours()}`;
    let m = `${now.getMinutes()}`;
    let s = `${now.getSeconds()}`;

    if (h.length === 1) h = `0${h}`;
    if (m.length === 1) m = `0${m}`;
    if (s.length === 1) s = `0${s}`;

    return `${h}-${m}-${s}`;
}

export function getDateFromFilename(name) {
    if (name !== undefined) {
        const filename = name.split('.')[0]; // leave filename, remove extension
        const dates = filename.split('-');
        const [h, m, s] = dates;
        const now = new Date();
        const Y = `${now.getFullYear()}`;
        const M = `${now.getMonth()}`;
        const D = `${now.getDate()}`;
        const date = new Date(Y, M, D, h, m, s, 0);
        return date;
    }
}

export function formatLocale(date) {
    return date.toLocaleString('en-US').toString();
}

export const remoteAPI = axios.create({
    baseURL: 'https://core.replus.co/api/',
    headers: {'Content-Type': 'text/plain'},
});

const base64Image = `data:frame/jpeg;base64, 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`;

export function getEventsDummy() {
    return [
        {
            data: base64Image,
            dev_id: 'dummy',
            name: '11-08-04.jpg',
        },
        {
            data: base64Image,
            dev_id: 'dummy',
            name: '11-08-05.jpg',
        },
        {
            data: base64Image,
            dev_id: 'dummy',
            name: '11-08-06.jpg',
        },
    ];
}

export function getNewRoomTemplate() {
    return {
        devices: {},
        name: 'My Room',
        owner: '',
        remotes: {},
        onEdit: true,
    };
}

export function getRoomsDummy() {
    return [
        {
            devices: {
                a: '296A',
                b: '297B',
                c: '298C',
                d: '299D',
            },
            name: 'Room 1',
            owner: 'owner-1',
            remotes: {
                'remote-a': 'TV LG',
                'remote-b': 'TV Sony',
                'remote-c': 'AC Panasonic',
                'remote-d': 'AC Mitsubishi',
            },
            onEdit: false,
        },
        {
            devices: {
                y: '2DF6',
                z: '2DDX',
            },
            name: 'Room 2',
            owner: 'owner-1',
            remotes: {
                'remote-a': 'TV LG',
                'remote-b': 'AC Samsung',
                'remote-c': 'TV Toshiba',
            },
            onEdit: false,
        },
    ];
}
