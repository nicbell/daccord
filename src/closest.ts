/**
 * Closest helper
 */
function closest(elem, selector: string) {

    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
        if (matchesSelector.bind(elem)(selector)) {
            return <Element>elem;
        } else {
            elem = elem.parentElement;
        }
    }
    return null;
}

export = closest;