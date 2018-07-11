let settings;

Storage.get(function(result) {
    settings = result;
    init();
})

function init() {
    document.getElementById("rate-in-euro").textContent = settings.rate;
    if (!settings.bias)
    {
        settings.bias = 0;
    }
    updateBiasDisplay();
    updateTipButton();
}

function updateTipButton() {
    let src = "/images/tip.jpg";
    let url = chrome.extension.getURL(src);
    document.getElementById("tip-image").src = url;
}

function updateBiasDisplay() {
    document.getElementById("bias-number").placeholder = settings.bias;
    document.getElementById("biased-rate-in-euro").textContent = settings.rate + settings.bias/100;
}

function reloadAmazonTabs() {
    let querying = chrome.tabs.query({url: "*://*.amazon.co.uk/*"},reloadTabs);
}

function reloadTabs(tabs) {
    for (let tab of tabs)
    {
        chrome.tabs.reload(tab.id);
    }
}
document.getElementById("apply-bias").onclick = function() {
    const numberInputed = document.getElementById("bias-number").value;
    if (numberInputed != "")
    {
        settings.bias = Number(numberInputed);
        Storage.set(settings, function () {
            console.log("Updated bias to " + settings.bias);
            updateBiasDisplay();
        });
        //auto refresh for new prices
        reloadAmazonTabs();
    }
};