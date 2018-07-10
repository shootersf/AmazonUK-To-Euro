let Storage = {
    get: function(callback) {
        chrome.storage.sync.get(["amazonUKtoEuro"], function(result) {
            callback(result.amazonUKtoEuro);
        });
    },
    set: function(settings, callback) {
        chrome.storage.sync.set({amazonUKtoEuro : settings}, callback);
    }
};