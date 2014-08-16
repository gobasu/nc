var Observer = require('../../src/nc/util/observer');

describe("nc.util.Observer suite", function() {
    it("Observer.listen", function() {
        var observer = new Observer();
        //console.dir(observer);
        var listener = function() {};
        var listener2 = function() {};

        observer.addListener('onTest', listener);
        observer.addListener('onTest2', listener2);

        expect(observer.hasListener('onTest', listener)).toBeTruthy();
        expect(observer.hasListener('onTest', listener2)).toBeFalsy();
        expect(observer.hasListener('onTest2', listener2)).toBeTruthy();
        expect(observer.hasListener('onTest2', listener)).toBeFalsy();

        observer = new Observer();
        observer.addListener(['onTest', 'onTest2'], listener);

        expect(observer.hasListener('onTest', listener)).toBeTruthy();
        expect(observer.hasListener('onTest2', listener)).toBeTruthy();

    });

    it("Observer.unlisten", function() {
        var observer = new Observer();
        var listener = function() {};
        var listener2 = function() {};

        observer.addListener('onTest', listener);
        observer.addListener('onTest2', listener2);

        expect(observer.hasListener('onTest', listener)).toBeTruthy();
        expect(observer.hasListener('onTest', listener2)).toBeFalsy();
        expect(observer.hasListener('onTest2', listener2)).toBeTruthy();
        expect(observer.hasListener('onTest2', listener)).toBeFalsy();

        observer.removeListener('onTest', listener);
        observer.removeListener('onTest2', listener2);

        expect(observer.hasListener('onTest', listener)).toBeFalsy();
        expect(observer.hasListener('onTest', listener2)).toBeFalsy();
        expect(observer.hasListener('onTest2', listener2)).toBeFalsy();
        expect(observer.hasListener('onTest2', listener)).toBeFalsy();

        observer = new Observer();
        observer.addListener(['onTest', 'onTest2'], listener);

        expect(observer.hasListener('onTest', listener)).toBeTruthy();
        expect(observer.hasListener('onTest2', listener)).toBeTruthy();

        observer.removeListener('onTest', listener);
        observer.removeListener('onTest2', listener);

        expect(observer.hasListener('onTest', listener)).toBeFalsy();
        expect(observer.hasListener('onTest2', listener)).toBeFalsy();

    });

    it("Observer.dispatch", function() {
        var observer = new Observer();
        var observer2 = new Observer();
        var listenerCalled = 0;
        var listener = function(event, count) {
            if (count) {
                listenerCalled += count;
            } else {
                ++listenerCalled;
            }
        };
        var listener2Called = 0;
        var listener2 = function() {
            ++listener2Called;
        };

        observer.addListener('onEvent', listener);
        observer.addListener('onEvent2', listener2);
        observer.dispatch('onEvent');

        expect(listenerCalled).toEqual(1);
        expect(listener2Called).toEqual(0);

        observer.dispatch('onEvent', 2);

        expect(listenerCalled).toEqual(3);
        expect(listener2Called).toEqual(0);

        observer.dispatch('onEvent2');

        expect(listenerCalled).toEqual(3);
        expect(listener2Called).toEqual(1);

        observer.dispatch('onEvent2', 2);

        expect(listenerCalled).toEqual(3);
        expect(listener2Called).toEqual(2);

        expect(observer2.hasListener('onEvent', listener)).toBeFalsy();
        expect(observer2.hasListener('onEvent', listener2)).toBeFalsy();
        expect(observer2.hasListener('onEvent2', listener2)).toBeFalsy();
        expect(observer2.hasListener('onEvent2', listener)).toBeFalsy();

    });

    it("Observer.extend", function() {

        var ChildObserver = Observer.extend(function init(){
            var self = this;

            self.sampleMethod = function() {};
            if (init.new) {
                self.init();
            }
        });


        var instance = new ChildObserver();
        var listener = function() {};
        var listener2 = function() {};

        instance.addListener('onTest', listener);
        instance.addListener('onTest2', listener2);

        expect(instance.hasListener('onTest', listener)).toBeTruthy();
        expect(instance.hasListener('onTest', listener2)).toBeFalsy();
        expect(instance.hasListener('onTest2', listener2)).toBeTruthy();
        expect(instance.hasListener('onTest2', listener)).toBeFalsy();

        instance = new ChildObserver();
        instance.addListener(['onTest', 'onTest2'], listener);

        expect(instance.hasListener('onTest', listener)).toBeTruthy();
        expect(instance.hasListener('onTest2', listener)).toBeTruthy();

    });
});