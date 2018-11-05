import {invert} from 'lodash';

import {env} from './configs';

export const userDataKey = ['uid', 'email', 'displayName', 'photoUrl'];

export const resolutionsList = ['320p', '480p', '720p', '1080p'];

export const rotationsList = ['0°', '90°', '180°', '270°'];

export const brandsList = ['samsung', 'lg', 'panasonic', 'toshiba', 'mitsubishi', 'daikin', 'dast'];

export const brandsAC = ['daikin', 'dast', 'lg', 'mitsubishi heavy industries', 'panasonic', 'panasonicOld', 'samsung', 'toshiba'];

export const fansAC = ['Auto', 'Low', 'Medium', 'High'];

export const modesAC = ['Auto', 'Cool', 'Dry', 'Heat'];

export const brandsTV = ['changhong', 'lg', 'panasonic', 'samsung', 'sanyo', 'sharp', 'sony', 'toshiba'];

export const upperCases = ['lg', 'tv', 'ac'];

export const TVBrandsCodeset = {
    lg: '1970',
    samsung: '0595',
    panasonic: '2619',
    sony: '1319',
    sharp: 'T001',
    changhong: '2903',
    sanyo: '1430',
    toshiba: '0339',
};

export const TVCommandsCodeset = {
    off: '16',
    power: '15',
    selection: '17',
    mute: '10',
    volumeUp: '13',
    volumeDown: '14',
    channelUp: '13',
    channelDown: '12',
};

export function getTVCodesetFromBrand(brand) {
    return TVBrandsCodeset[brand];
}

export function getTVBrandFromCodeset(codeset) {
    const invertedTVCodeset = invert(TVBrandsCodeset);
    return invertedTVCodeset[codeset];
}

export function getTVCodesetFromCommand(command) {
    return TVCommandsCodeset[command];
}

export function getTVCommandFromCodeset(codeset) {
    const invertedTVCodeset = invert(TVCommandsCodeset);
    return invertedTVCodeset[codeset];
}

export function hideOnClickOutside(element) {
    const outsideClickListener = (event) => {
        if (!element.contains(event.target)) {
            if (isBlock(element)) {
                element.style.display = 'none';
                removeClickListener();
            }
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
}

const isBlock = (elem) => elem.style.display == 'block';

export const pushLocationTo = (location) => {
    window.history.pushState({}, null, location);
    window.dispatchEvent(new CustomEvent('location-changed'));

    window.location.href = location;
};

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

export function getNewRoomTemplate(roomName) {
    return {
        devices: [],
        name: roomName,
        owner: '',
        id: '',
        remotes: [],
        cameras: [],
        test: '',
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

export function toTitleCase(str) {
    if (str) {
        str = str.toLowerCase();
        return str.replace(/\w\S*/g, function(txt) {
            const shouldUpperCase = upperCases.indexOf(txt) > -1;
            if (shouldUpperCase) {
                return txt.toUpperCase();
            } else {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        });
    }
}

export function stringContain(str, target) {
    return str.indexOf(target) !== -1;
}

export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function getCookie(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export function pageToTitle(page) {
    if (page) {
        // Take the last subpage
        let title = page.split('/')[1];

        if (!title) {
            // Because default page is rooms
            title = 'rooms';
        }

        // Fix upercases like Room-tv or Room-ac
        title = title
            .split('-')
            .map((item) => toTitleCase(item))
            .join(' ');

        return title;
    }
}

export function camelToSentence(str) {
    return str.replace(/^[a-z]|[A-Z]/g, (v, i) => {
        return i === 0 ? v.toUpperCase() : ' ' + v.toLowerCase();
    });
}

export function mobileCheck() {
    let check = false;
    (function(a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
                a.substr(0, 4)
            )
        ) {
            check = true;
        }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

export function log(message) {
    if (!env.PRODUCTION) {
        console.log(message);
    }
}

// Filter from duplicate array item and empty array item string
export function removeDuplicateAndEmpty(input) {
    let output = [];

    output = input.filter((item, pos) => {
        return (item.length > 0) && (input.indexOf(item) == pos);
    })

    return output;
}
