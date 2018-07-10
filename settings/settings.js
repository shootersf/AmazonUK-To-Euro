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
    document.getElementById("bias-number").placholder = settings.bias;
    document.getElementById("biased-rate-in-euro").textContent = settings.rate + settings.bias/100;
}