const ONE_HOUR = 3600000;  //in ms. Lenght of time to keep rate cached
let rate;
let timeoutHandle;  //used for recalling init after the webpage mutates.
const doc = document.body;
const config = { attributes: true, childList: true, characterData: true, subtree: true}

const observer = new MutationObserver(function(m) {
    //ignore "ddmFastestCountdown" as it updates every second on the page
    if (m[0].target != document.getElementById("ddmFastestCountdown"))
    {
        //reset the script timer so it only reruns when the page is no longer modifying.
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
            console.log("fixing mutation");
            init();
        }, 1000);
    }
});

// Start by checking our date in storage. If it exists and is less than an hour old pull stored rate else get new rate from api
chrome.storage.sync.get(["date"], function(lastUpdated) {
    console.log(lastUpdated);
    if ($.isEmptyObject(lastUpdated) || (Date.now() - lastUpdated.date > ONE_HOUR))
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
        const now = Date.now();
        chrome.storage.sync.set({date: now}, function() {console.log("Date set to " + now);});
        chrome.storage.sync.set({saved_rate: rate}, function() {console.log("Saved_Rate set to " + rate)});
        console.log ("NEW RATE = " + rate);
        init();
    });
}

function loadCurrentRate() {
    chrome.storage.sync.get(["saved_rate"], function(savedRate) {
        rate = savedRate.saved_rate;
        console.log(rate);
        init();
    })
}

function init() {
    //Get initial elements that contain pound symbol
    const poundElementsXpath = document.evaluate('//*[contains(text(), "£")]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
    //convert to an array
    const poundElements = [];
    for (let i =0; i < poundElementsXpath.snapshotLength; i++)
    {
        poundElements.push(poundElementsXpath.snapshotItem(i));
    }
    changeLines(poundElements);

}

function changeLines(lines) {
    //filter out lines that don't match /^£\d+[.]\d{2}$/ (pounds and pence only)
    const search = /^£\d+[.]\d{2}$/;
    lines = lines.filter(line => search.test(line.textContent.trim()));
    console.log(lines);
    //update price on all remaining lines
    //stop observer so it doesn't fire while we change the DOM
    observer.disconnect();
    lines.forEach(element => {
        //drops £ symbol
        let price = Number(element.textContent.trim().substring(1));
        //converts to euros
        price = (price * rate).toFixed(2);
        price = "€" + price;
        //update element
        element.textContent = price;
    });
    //turn observer back on
    observer.observe(doc, config);
}