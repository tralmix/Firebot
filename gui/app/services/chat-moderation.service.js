"use strict";

(function() {

    const moment = require("moment");

    angular
        .module("firebotApp")
        .factory("chatModerationService", function(backendCommunicator) {
            let service = {};

            service.chatModerationData = {
                settings: {
                    bannedWordList: {
                        enabled: false,
                        exemptRoles: [],
                        outputMessage: ""
                    },
                    emoteLimit: {
                        enabled: false,
                        exemptRoles: [],
                        max: 10,
                        outputMessage: ""
                    },
                    urlModeration: {
                        enabled: false,
                        exemptRoles: [],
                        viewTime: {
                            enabled: false,
                            viewTimeInHours: 0
                        },
                        outputMessage: ""
                    },
                    exemptRoles: []
                },
                bannedWords: [],
                bannedRegularExpressions: []
            };

            service.loadChatModerationData = () => {
                let data = backendCommunicator.fireEventSync("getChatModerationData");
                if (data != null) {
                    service.chatModerationData = data;
                    if (service.chatModerationData.settings.exemptRoles == null) {
                        service.chatModerationData.settings.exemptRoles = [];
                    }

                    if (service.chatModerationData.settings.bannedWordList.exemptRoles == null) {
                        service.chatModerationData.settings.bannedWordList.exemptRoles = [];
                    }

                    if (service.chatModerationData.settings.bannedWordList.outputMessage == null) {
                        service.chatModerationData.settings.bannedWordList.outputMessage = "";
                    }

                    if (service.chatModerationData.settings.emoteLimit == null) {
                        service.chatModerationData.settings.emoteLimit = {
                            enabled: false,
                            exemptRoles: [],
                            max: 10,
                            outputMessage: ""
                        };
                    }
                    if (service.chatModerationData.settings.emoteLimit.exemptRoles == null) {
                        service.chatModerationData.settings.emoteLimit.exemptRoles = [];
                    }

                    if (service.chatModerationData.settings.emoteLimit.outputMessage == null) {
                        service.chatModerationData.settings.emoteLimit.outputMessage = "";
                    }

                    if (service.chatModerationData.settings.urlModeration.exemptRoles == null) {
                        service.chatModerationData.settings.urlModeration.exemptRoles = [];
                    }
                }
            };

            service.saveChatModerationSettings = () => {
                backendCommunicator.fireEvent("chatMessageSettingsUpdate", service.chatModerationData.settings);
            };

            service.addBannedWords = (words) => {

                let normalizedWords = words
                    .filter(w => w != null && w.trim().length > 0 && w.trim().length < 360)
                    .map(w => w.trim().toLowerCase());

                let mapped = [...new Set(normalizedWords)].map(w => {
                    return {
                        text: w,
                        createdAt: moment().valueOf()
                    };
                });

                service.chatModerationData.bannedWords = service.chatModerationData.bannedWords.concat(mapped);

                backendCommunicator.fireEvent("addBannedWords", mapped);
            };

            service.addBannedRegex = (regex) => {
                let mapped = [
                    {
                        text: regex,
                        createdAt: moment().valueOf()
                    }
                ];

                service.chatModerationData.bannedRegularExpressions = service.chatModerationData.bannedRegularExpressions.concat(mapped);

                backendCommunicator.fireEvent("addBannedRegularExpression", mapped);
            };

            service.removeBannedWordAtIndex = (index) => {
                let word = service.chatModerationData.bannedWords[index];
                if (word) {
                    backendCommunicator.fireEvent("removeBannedWord", word.text);
                    service.chatModerationData.bannedWords.splice(index, 1);
                }
            };

            service.removeBannedWordByText = (text) => {
                let index = service.chatModerationData.bannedWords.findIndex(w => w.text === text);
                if (index > -1) {
                    service.removeBannedWordAtIndex(index);
                }
            };

            service.removeAllBannedWords = () => {
                service.chatModerationData.bannedWords = [];
                backendCommunicator.fireEvent("removeAllBannedWords");
            };

            service.removeRegexAtIndex = (index) => {
                let regex = service.chatModerationData.bannedRegularExpressions[index];
                if (regex) {
                    backendCommunicator.fireEvent("removeBannedRegularExpression", regex.text);
                    service.chatModerationData.bannedRegularExpressions.splice(index, 1);
                }
            };

            service.removeRegex = (regex) => {
                let index = service.chatModerationData.bannedRegularExpressions.findIndex(r => r.text === regex);
                if (index > -1) {
                    service.removeRegexAtIndex(index);
                }
            };

            service.removeAllBannedRegularExpressions = () => {
                service.chatModerationData.bannedRegularExpressions = [];
                backendCommunicator.fireEvent("removeAllBannedRegularExpressions");
            };

            service.registerPermitCommand = () => {
                backendCommunicator.fireEvent("registerPermitCommand");
            };

            service.unregisterPermitCommand = () => {
                backendCommunicator.fireEvent("unregisterPermitCommand");
            };

            return service;
        });
}());
