function isLiteralObject(object) {
    return object && typeof object === "object" && Object.getPrototypeOf(object) === Object.getPrototypeOf({});
}
module.exports = isLiteralObject;