'use strict';

(function() {

    const WebSocket = require('ws');
    const WebSocketServer = WebSocket.Server;

    // This provides methods for sending stuff to the websocket

    angular
        .module('firebotApp')
        .factory('websocketService', function (listenerService, settingsService) {
            let service = {};

            // Setup the WebSocketServer with the saved port.
            let port = settingsService.getWebSocketPort();
            const wss = new WebSocketServer({
                port: port
            });

            function showText(data) {
                let showTextPosition = data.showTextPosition;
                let showTextHeight = data.showTextHeight;
                let showTextWidth = data.showTextWidth;
                let showTextDuration = parseInt(data.showTextDuration);
                let showTextColor = data.showTextColor;
                let showTextBackgroundColor = data.showTextBackgroundColor;
                let showTextFontSize = data.showTextFontSize;
                let showTextType = data.showTextType;
                let showTextAlignment = data.showTextAlignment;

                // Set defaults if they werent filled out.
                if (showTextPosition === "" || showTextPosition == null) {
                    showTextPosition = "Top Middle";
                }
                if (showTextHeight === "" || showTextHeight == null) {
                    showTextHeight = false;
                }
                if (showTextWidth === "" || showTextWidth == null) {
                    showTextWidth = false;
                }
                if (showTextDuration === "" || showTextDuration == null) {
                    showTextDuration = 5;
                }
                if (showTextColor === "" || showTextColor == null) {
                    showTextColor = "#ffffff";
                }
                if (showTextBackgroundColor === "" || showTextBackgroundColor == null) {
                    showTextBackgroundColor = "transparent";
                }
                if (showTextFontSize === "" || showTextFontSize == null) {
                    showTextFontSize = "1em";
                }

                // Compile data and send to overlay.
                let broadCastData = {
                    "event": "showText",
                    "showTextType": data.showTextType,
                    "resourceToken": data.resourceToken,
                    "showTextText": data.showTextText,
                    "showTextAlignment": data.showTextAlignment,
                    "showTextColor": showTextColor,
                    "showTextBackgroundColor": showTextBackgroundColor,
                    "showTextFontSize": showTextFontSize,
                    "showTextPosition": showTextPosition,
                    "showTextHeight": showTextHeight,
                    "showTextWidth": showTextWidth,
                    "showTextDuration": showTextDuration,
                    "enterAnimation": data.enterAnimation,
                    "exitAnimation": data.exitAnimation,
                    "customCoords": data.customCoords
                };

                service.broadcast(broadCastData);
            }

            function showImage(data) {
                let filepath = data.filepath;
                let imagePosition = data.imagePosition;
                let imageHeight = data.imageHeight;
                let imageWidth = data.imageWidth;
                let imageDuration = parseInt(data.imageDuration);

                // Set defaults if they werent filled out.
                if (imagePosition === "" || imagePosition == null) {
                    imagePosition = "Top Middle";
                }
                if (imageHeight === "" || imageHeight == null) {
                    imageHeight = false;
                }
                if (imageWidth === "" || imageWidth == null) {
                    imageWidth = false;
                }
                if (imageDuration === "" || imageDuration == null) {
                    imageDuration = 5;
                }


                // Compile data and send to overlay.
                let broadCastData = {
                    "event": "image",
                    "filepath": filepath,
                    "url": data.url,
                    "imageType": data.imageType,
                    "resourceToken": data.resourceToken,
                    "imagePosition": imagePosition,
                    "imageHeight": imageHeight,
                    "imageWidth": imageWidth,
                    "imageDuration": imageDuration,
                    "enterAnimation": data.enterAnimation,
                    "exitAnimation": data.exitAnimation,
                    "overlayInstance": data.overlayInstance,
                    "customCoords": data.customCoords
                };

                service.broadcast(broadCastData);
            }

            function showVideo(data) {
                let videoType = data.videoType;
                let filepath = data.filepath;
                let youtubeId = data.youtubeId;
                let videoPosition = data.videoPosition;
                let videoHeight = data.videoHeight;
                let videoWidth = data.videoWidth;
                let videoDuration = parseInt(data.videoDuration);
                let videoVolume = data.videoVolume;
                let videoStarttime = data.videoStarttime;

                // Set defaults if they werent filled out.
                if (videoPosition === "" || videoPosition == null) {
                    videoPosition = "Top Middle";
                }
                if (videoHeight === "" || videoHeight == null) {
                    videoHeight = false;
                }
                if (videoWidth === "" || videoWidth == null) {
                    videoWidth = false;
                }
                if (videoDuration === null || videoDuration === undefined || isNaN(videoDuration)) {
                    videoDuration = 5;
                }

                // Compile data and send to overlay.
                let broadcastdata = {
                    "event": "video",
                    "videoType": videoType,
                    "filepath": filepath,
                    "resourceToken": data.resourceToken,
                    "youtubeId": youtubeId,
                    "videoPosition": videoPosition,
                    "videoHeight": videoHeight,
                    "videoWidth": videoWidth,
                    "videoDuration": videoDuration,
                    "videoVolume": videoVolume,
                    "videoStarttime": videoStarttime,
                    "enterAnimation": data.enterAnimation,
                    "exitAnimation": data.exitAnimation,
                    "overlayInstance": data.overlayInstance,
                    "customCoords": data.customCoords
                };

                service.broadcast(broadcastdata);
            }

            // Shows HTML
            // This function takes info given from the main process and then sends a request to the overlay to render it.
            function showHtml(data) {
                data.event = "html";

                service.broadcast(data);
            }

            // Websocket Server
            // This allows for the guiBroadcast call to send out data via websocket.
            service.broadcast = function(data) {
                data = JSON.stringify(data);
                console.log(data);
                wss.clients.forEach(function each(client) {
                    client.send(data);
                });
            };

            // Watches for an event from main process
            listenerService.registerListener(
                { type: listenerService.ListenerType.SHOW_TEXT },
                (data) => {
                    showText(data);
                });

            listenerService.registerListener(
                { type: listenerService.ListenerType.SHOW_VIDEO },
                (data) => {
                    showVideo(data);
                });

            // Watches for an event from main process
            listenerService.registerListener(
                { type: listenerService.ListenerType.SHOW_IMAGE },
                (data) => {
                    showImage(data);
                });

            // Watches for an event from main process
            listenerService.registerListener(
                { type: listenerService.ListenerType.SHOW_HTML },
                (data) => {
                    showHtml(data);
                });

            // Watches for an event from main process
            listenerService.registerListener(
                { type: listenerService.ListenerType.CELEBREATE },
                (data) => {
                    service.broadcast(data);
                });

            return service;
        });
}());
