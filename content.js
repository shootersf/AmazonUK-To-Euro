const ONE_HOUR = 3600000;  //in ms. Lenght of time to keep rate cached
let rate;
let timeoutHandle;
const doc = document.body;
const config = { attributes: true, childList: true, characterData: true, subtree: true}
const observer = new MutationObserver(function(m) {
    console.log("mutating");
    if (m[0].target != document.getElementById("ddmFastestCountdown"))
    {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
            console.log("fixing mutation");
            init();
        }, 1000);
    }
    else
    console.log('ignoring counter');
    
});

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
        const now = Date.now();
        chrome.storage.sync.set({date: now}, function() {console.log("Date set to " + now);});
        chrome.storage.sync.set({saved_rate: rate}, function() {console.log("Saved_Rate set to " + rate)});
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
    observer.disconnect();

    let poundElements = document.evaluate('//*[contains(text(), "£")]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
    poundElements = getPoundOnlyElements(poundElements);
    poundElements.forEach(element => {
        let price = Number(element.textContent.trim().substring(1));
        price = (price * rate).toFixed(2);
        price = "€" + price;
        element.textContent = price;
    });

    setTimeout(() => {observer.observe(doc, config);}, 300);
}

function getPoundOnlyElements(elements) {
    const poundOnlyArr = [];
    const search = /^£\d+[.]\d{2}$/;
    //const search = /^£/;
    for (let i =0; i < elements.snapshotLength; i++)
    {
        if (search.test(elements.snapshotItem(i).innerHTML.trim()))
        {
            poundOnlyArr.push(elements.snapshotItem(i));
            console.log(elements.snapshotItem(i).innerHTML)
        }
    }
    return poundOnlyArr;
}

