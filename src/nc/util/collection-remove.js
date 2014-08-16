function collectionRemove(arr, item) {
    var i;
    while((i = arr.indexOf(item)) !== -1) {
        arr.splice(i, 1);
    }
}
module.exports = collectionRemove;