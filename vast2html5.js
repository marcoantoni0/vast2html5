/*
 * VAST2HTML5 - Play VAST 3.0 Ads on HTML5 Video
 * https://github.com/marcoantoniocanhas/vast2html5
 * Marco Antônio w/ Elav
 * Version 1.0 2016-01-15
*/

"use strict";

var formats = ['mp4', 'webm', 'ogg'],
    vast_obj = {},
    adSystem,
    adTitle,
    impression,
    Creative,
    item,
    creative,
    duration,
    videoClick,
    mediaFiles,
    mediaTag,
    trackingEvents,
    evt,
    resp;

vast_obj.creative = [];

function vast2html5(url, id) {
    var el = document.getElementById(id),
        elSize = el.getAttribute('width') + 'x' + el.getAttribute('height'),
        vastData = readVAST(url),
        source = document.createElement('source'),
        events,
        img = document.createElement('img');

    img.width = "1px";
    img.height = "1px";
    img.style.display = "none";
    img.src = vastData.impression;
    img.id = 'events' + id;
    document.body.appendChild(img);
    var imgEvents = document.getElementById('events' + id);

    if (elSize in vast_obj.creative[0].medias) {
        var format = vast_obj.creative[0].medias[elSize];

        for (var prop in format) {
            if (formats.indexOf(prop) < 0) {
                console.warn("Os formatos de vídeo encontrados no anúncio não são compatíveis com o player.");
                break;
            }

            source.src = format[prop].url;
            source.type = 'video/' + prop;
            el.appendChild(source);
        }
    } else {
        console.warn("O tamanho informado não foi encontrado no anúncio.");
    }

    // Set events on video
    events = vast_obj.creative[0].trackingEvents;
    el.addEventListener("play", function(e) {
        imgEvents.setAttribute('src', events.start);
    }, false);

    el.addEventListener("pause", function(e) {
        imgEvents.setAttribute('src', events.pause);
    }, false);

    el.addEventListener("ended", function(e) {
        imgEvents.setAttribute('src', events.complete);
    }, false);

    el.addEventListener("volumechange", function(e) {
        (el.volume == 0) ? imgEvents.setAttribute('src', events.start) : false;
    }, false);
    console.log(vastData);
}


function readVAST(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    console.info('Open request');

    request.onload = function() {
        if (request.status >= 200 && request.status < 400)
            resp = makeObject(request.responseXML);
        else
            console.error('Chegou no servidor, mas retornou erro');
    }

    request.onerror = function() { console.error('Erro de conexão.'); };
    request.send();

    return resp;
} // readVAST


function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}


function makeObject(data) {
    console.log('-- DEBUG --');

    // Set AdSystem
    adSystem = data.getElementsByTagName('AdSystem')[0];
    if (adSystem != null)
        vast_obj.adSystem = adSystem.childNodes[0].nodeValue;
    // console.log("Ad System: " + vast_obj.adSystem);

    // Set AdTitle
    adTitle = data.getElementsByTagName('AdTitle')[0];
    if (adTitle != null)
        vast_obj.adTitle = adTitle.childNodes[0].nodeValue;
    // console.log("Título: " + vast_obj.adTitle);

    // Set Impression URL
    impression = data.getElementsByTagName('Impression')[0];
    if (impression != null)
        vast_obj.impression = impression.childNodes[0].nodeValue;
    // console.log("URL de impressão: " + vast_obj.impression);

    // Set Creatives infos (Media, Duration, Format, Tracking Events, Video Clicks)
    Creative = data.getElementsByTagName("Creative");

    for (var i = 0; i < Creative.length; i++) {
        item = Creative[i].getElementsByTagName("Linear");

        if (item != null) {
            creative = vast_obj.creative[i] = {};
            vast_obj.creative[i].trackingEvents = {};
            vast_obj.creative[i].medias = {};

            // Set Duration
            duration = item[i].getElementsByTagName('Duration')[0];
            if (duration != null) {
                creative.duration = duration.childNodes[0].nodeValue;

                // Duration2seconds
                var a = creative.duration.split(":");
                duration = (a[0] * 60 * 60) + (a[1] * 60) + a[2];
                creative.durationSeconds = duration;
            }

            // Set ClickThrough
            videoClick = item[i].getElementsByTagName('ClickThrough');
            if (videoClick != null)
                creative.click = videoClick[0].childNodes[0].nodeValue;

            // Set Tracking Events
            trackingEvents = item[i].getElementsByTagName('Tracking');
            if (trackingEvents != null) {
                for (var j = 0; j < trackingEvents.length; j++) {
                    evt = trackingEvents[j];
                    creative.trackingEvents[evt.getAttribute('event')] = evt.childNodes[0].nodeValue;
                }
            }

            // Set Medias
            mediaFiles = item[i].getElementsByTagName('MediaFile');
            if (mediaFiles != null) {
                for (var j = 0; j < mediaFiles.length; j++) {
                    mediaTag = mediaFiles[j];

                    // Set width key
                    var wXh = mediaTag.getAttribute('width') + 'x' + mediaTag.getAttribute('height');
                    creative.medias[wXh] = (isEmpty(creative.medias[wXh])) ? {} : creative.medias[wXh];

                    // Set type key
                    var type = mediaTag.getAttribute('type').split('/').slice(-1)[0];
                    creative.medias[wXh][type] = {};

                    // Set url prop
                    creative.medias[wXh][type].url = mediaTag.childNodes[0].nodeValue;
                }
            }
        } // if (item != null)
    }

    return vast_obj;
}