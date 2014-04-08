'use strict';

function handleRequest (details) {
    var header;
    for (var i = 0; i < details.requestHeaders.length; ++i) {
        header = details.requestHeaders[i];
        if (header.name === 'Origin' && !header.value) {
            header.value = details.url || 'http://evil.com';
            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
}

function handleRespone (details) {
    var header,
        allowHeaders = ['Authorization', 'Auth', 'Token', 'Access-Token', 'Access_Token', 'AccessToken', 'Code'],
        originFinded = false,
        headerFinded = false;

    for (var i = 0; i < details.responseHeaders.length; ++i) {
        header = details.responseHeaders[i];
        if (!originFinded || !headerFinded) {
            if (header.name === 'Access-Control-Allow-Origin') {
                header.value = '*';
                originFinded = true;
            }
            else if (header.name === 'Access-Control-Allow-Headers') {
                header.value = allowHeaders.join(',');
                headerFinded = true;
            }
        } else {
            break;
        }
    }

    if (!originFinded) {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Origin',
            value: '*'
        });
    }
    if (!headerFinded) {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Headers',
            value: allowHeaders.join(',')
        });
    }

    return {responseHeaders: details.responseHeaders};
}

function setOn () {
    chrome.browserAction.setBadgeText({text: 'on'});
    chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
    chrome.webRequest.onBeforeSendHeaders.addListener(handleRequest, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders']);
    chrome.webRequest.onHeadersReceived.addListener(handleRespone, {urls: ['<all_urls>']}, ['blocking', 'responseHeaders']);
}
function setOff () {
    chrome.browserAction.setBadgeText({text: 'off'});
    chrome.browserAction.setBadgeBackgroundColor({color: [128, 128, 128, 200]});
    chrome.webRequest.onBeforeSendHeaders.removeListener(handleRequest);
    chrome.webRequest.onHeadersReceived.removeListener(handleRespone);
}

if (localStorage.getItem('on')) {
    setOn();
} else {
    setOff();
}

chrome.browserAction.onClicked.addListener(function () {
    if (localStorage.getItem('on')) {
        localStorage.setItem('on', '');
        setOff();
    } else {
        localStorage.setItem('on', '1');
        setOn();
    }
});
