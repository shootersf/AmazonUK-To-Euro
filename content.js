const ONE_HOUR = 3600000;  //in ms. Lenght of time to keep rate cached

let rate;
// Start by checking our date in storage. If it exists and is less than an hour ago pull stored rate else get new rate from api
chrome.storage.sync.get(["date"], function(lastUpdated) {
    console.log(lastUpdated);
    if ($.isEmptyObject(lastUpdated) || (Date.now() - lastUpdated > ONE_HOUR))
    {
        //Get a new rate
        getNewRate();
    }
    else 
    {
        //Load current rate
        loadCurrentRate()
    }
});

//Gets a new rate and stores it with the current time. Then starts converting the page to euros
function getNewRate() {
    $.getJSON('https://free.currencyconverterapi.com/api/v5/convert?q=GBP_EUR&compact=ultra', function(data){
        rate = data.GBP_EUR;
        let now = Date.now();
        chrome.storage.sync.set({date: now}, function() {console.log("Date set to " + now);});
        chrome.storage.sync.set({saved_rate: rate}, function() {console.log("Saved_Rate set to " + rate)});
        init();
    });
}

function loadCurrentRate() {
    chrome.storage.sync.get(["saved_rate"], function(savedRate) {
        rate = savedRate.saved_rate;
        console.log(rate);
    })
}




console.log("Testing....");
let results = document.evaluate('//*[contains(text(), "£")]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
console.log(results.snapshotLength)
 for (let i =0; i < results.snapshotLength; i++)
 {
    results.snapshotItem(i).style.backgroundColor = "red";
 }

//  $.getJSON('https://free.currencyconverterapi.com/api/v5/convert?q=GBP_EUR&compact=ultra', function(data){
//     console.log("here");
// 	console.log(data);
// });