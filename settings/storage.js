const ONE_HOUR = 3600000;  //in ms. Lenght of time to keep rate cached
const debug = false;

let Storage = {
    get: function(callback) {
        chrome.storage.sync.get(["amazonUKtoEuro"], function(result) {
            //if it exists and is less than an hour old callback
            if (!$.isEmptyObject(result) && Date.now() - result.amazonUKtoEuro.date < ONE_HOUR && debug === false)
            {
                callback(result.amazonUKtoEuro);
                console.log("recalled settings: ");
                console.log(result.amazonUKtoEuro);
            }  
            else
            {
                //get new rate and send that
                $.getJSON('https://free.currencyconverterapi.com/api/v5/convert?q=GBP_EUR&compact=ultra', function(data){
                const now = Date.now();
                //set the dat to now and the new rate to JSON
                let settings = {};
                settings.date = now;
                settings.rate = data.GBP_EUR;
                //check for a bias and add it, if not default to 0
                if (result.amazonUKtoEuro.bias)
                    {settings.bias = result.amazonUKtoEuro.bias;}
                else
                    {settings.bias = 0;}
                //finally set the settings and return them to the callback
                Storage.set(settings, function(){console.log("settings Updated")});
                console.log(settings);
                callback(settings);
                });
            }

        });
    },
    set: function(settings, callback) {
        chrome.storage.sync.set({amazonUKtoEuro : settings}, callback);
    }
};