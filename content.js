
let timeoutHandle;  //used for recalling init after the webpage mutates.
const documentBody = document.body;
const observerConfig = { attributes: true, childList: true, characterData: true, subtree: true}
let settings = {}; //will load and be saved to storage. Contains date of last updated rate, rate and user bias settings.

//create a mutation observer to watch for changes on the site. Amazon loads in new content at varies points.
//observer will call init() when changes stop.
const observer = new MutationObserver(function(m) {
    //ignore "ddmFastestCountdown" as it updates every second on the page
    if (m[0].target != document.getElementById("ddmFastestCountdown"))
    {
        //reset the script timer so it only reruns when the page is no longer modifying.
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
            init();
        }, 1000);
    }
});

//BEGINNING OF SCRIPT

// Start by getting our rate out of storage
Storage.get(function (result) {
    settings = result;
    //start
    init();
});
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
    //search for pounds and filter out any script elements and our created tooltips
    let search = /£\d+[.]\d{2}/;
    lines = lines.filter(line => search.test(line.textContent));
    lines = lines.filter(line => line.tagName != "SCRIPT");
    lines = lines.filter(line => line.className != "uk2euro-tooltip");

    //update price on all remaining lines
    //stop observer so it doesn't fire while we change the DOM
    observer.disconnect();

    //change search to global
    search = /£\d+[.]\d{2}/g;

    lines.forEach(line => {
        //get initial pounds and keep for replace.
        const initialPounds = line.textContent.match(search);
        //make a copy to work on (this could have been buggy except I reassing below phew-refactor)
        let newPrices = initialPounds;
        //drop Pound symbol from string and convert to number
        newPrices = newPrices.map(price => Number(price.substring(1)));
        //convert to Euros and back to string
        newPrices = newPrices.map(price => "~€" + (price * (settings.rate + settings.bias/100)).toFixed(2));
        //loop through and replace. Also prepare HTML for ease of access to add toolip
        for (let i = 0; i < initialPounds.length; i++)
        {
            
            let newHTMLinjection = `<span class="uk2euro-price" data-ukprice="${initialPounds[i]}">${newPrices[i]}<span class="uk2euro-tooltip"></span></span>`
            line.innerHTML = line.innerHTML.replace(initialPounds[i],newHTMLinjection);
        }
    });
    //add tooltips
    addTooltips();

    //turn observer back on
    observer.observe(documentBody, observerConfig);
}

function addTooltips() {
    const allUpdates = document.getElementsByClassName("uk2euro-price");

    for (let i = 0; i < allUpdates.length; i++)
    {
        let tooltip = allUpdates[i].querySelector(".uk2euro-tooltip");
        tooltip.textContent = allUpdates[i].dataset.ukprice;
    }
}
let firing = false;
document.addEventListener("keydown", toggleCurrencies);
document.addEventListener("keyup", (event) => {if (event.key === "?") firing = false;});

function toggleCurrencies(event) {
    console.log(event.key);
    if (event.key === "?" && !firing)
    {
        firing = true;
        let euros = document.getElementsByClassName("uk2euro-price");
        let pounds = document.getElementsByClassName("uk2euro-tooltip");

        for (let i = 0; i < euros.length; i++)
        {
            euros[i].classList.toggle("override-hide");
        }
        for (let i = 0; i < pounds.length; i++)
        {
            pounds[i].classList.toggle("override-show");
        }
    }
    
}