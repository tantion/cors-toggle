'use strict';

function getAllowHeader () {
    var allowHeaders = localStorage.getItem('allowHeaders') || '';

    if (!allowHeaders) {
        allowHeaders = ['Authorization', 'Auth', 'Token', 'Access-Token', 'Access_Token', 'AccessToken', 'Code'];
    } else {
        allowHeaders = allowHeaders.split(',');
    }

    return allowHeaders;
}

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

// Though RFC 7230 says HTTP headers should be case-sensitive,
// we could be nice to developers using lower-case headers.
function lowerCaseEqual(a, b) {
    return typeof a === 'string' && a.toLowerCase() === b;
}

function handleRespone (details) {
    var header = null,
        allowHeaders = getAllowHeader(),
        originFound = false,
        headerFound = false;

    for (var i = 0, len = details.responseHeaders.length; i < len; ++i) {
        header = details.responseHeaders[i];
        if (!originFound || !headerFound) {
            if (lowerCaseEqual(header.name, 'access-control-allow-origin')) {
                //header.value = origin;
                originFound = true;
            }
            else if (lowerCaseEqual(header.name, 'access-control-allow-headers')) {
                //header.value += ',' + allowHeaders.join(',');
                headerFound = true;
            }
        } else {
            break;
        }
    }

    if (!originFound) {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Origin',
            value: '*',
        });
    }
    if (!headerFound) {
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
    chrome.webRequest.onBeforeSendHeaders.addListener(handleRequest, {urls: ['<all_urls>'], types: ['xmlhttprequest']}, ['blocking', 'requestHeaders']);
    chrome.webRequest.onHeadersReceived.addListener(handleRespone, {urls: ['<all_urls>'], types: ['xmlhttprequest']}, ['blocking', 'responseHeaders']);
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
