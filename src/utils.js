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

export const resolutionsList = ['320p', '480p', '720p', '1080p'];

export const rotationsList = ['0°', '90°', '180°', '270°'];

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

export function expandResolution(resolution) {
    const num = parseInt(resolution.split('p')[0]);
    let output = {
        width: 0,
        height: 0,
    };

    switch (num) {
        case 320:
            output.width = 480;
            output.height = 320;
            break;
        case 480:
            output.width = 480;
            output.height = 640;
            break;
        case 720:
            output.width = 720;
            output.height = 1280;
            break;
        case 1080:
            output.width = 1920;
            output.height = 1080;
            break;
    }

    return output;
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

export function qs(obj) {
    const params = new URLSearchParams();

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            params.append(key, obj[key]);
        }
    }

    return params;
}
