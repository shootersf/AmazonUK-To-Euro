console.log("Testing....");
let results = document.evaluate('//*[contains(text(), "£")]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
console.log(results.snapshotLength)
 for (let i =0; i < results.snapshotLength; i++)
 {
    results.snapshotItem(i).style.backgroundColor = "red";
 }