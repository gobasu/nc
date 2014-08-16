var Class = require('../../src/nc/util/class');
describe("nc.util.Class suite", function() {

    it("Class - define", function() {
        var Example = Class(function() { });

        var ins = new Example();

        expect(ins instanceof Example).toBeTruthy();

        var Example = Class(function() {
            var self = this;

            self.sampleMethod = function() {

            };
        });

        var ins = new Example();

        expect(typeof ins.sampleMethod).toEqual('function');

    });

    it("Class - constructor", function() {
        var _initCalled = false;
        var Example = Class(function Example(a, b) {
            var self = this;

            self.init = function(a, b) {
                _initCalled = true;
                self.sum = a + b;
            };

            if (Example.new) {
                self.init(a, b);
            }
        });

        expect(_initCalled).toBeFalsy();

        var ins = new Example(1, 2);
        expect(_initCalled).toBeTruthy();
        expect(ins.sum).toEqual(3);

    });

    it("Class.extend", function() {
        var _initCalled = false;
        var ParentClass = Class(function ParentClass(a) {

            var self = this;

            self.init = function(a) {
                self.a = a;
                _initCalled = true;
            };

            if (ParentClass.new) {
                self.init(a);
            }
        });
        expect(_initCalled).toBeFalsy();

        var ChildClass = ParentClass.extend(function ChildClass(a) {
            var self = this;

            if (ChildClass.new) {
                self.init(a);
            }
        });

        expect(_initCalled).toBeFalsy();

        var ins = new ChildClass('test');

        expect(_initCalled).toBeTruthy();
        expect(ins instanceof ChildClass).toBeTruthy();
        expect(ins instanceof ParentClass).toBeTruthy();

    });

    it("Class.static", function() {
        var value;

        var staticMethodTest = function () {

        };

        var StaticTest = Class(function StaticTest() {

            var self = this;

            self.doTest = function() {
                self.value = StaticTest.STAT_B;
            }

        }).static({
            staticMethod: function() {
                value = StaticTest.STAT_A;
            },
            STAT_A: 'a',
            STAT_B: 'b'
        });

        expect(typeof StaticTest.staticMethod === 'function').toBeTruthy();

        var StaticChild = StaticTest.extend(function StaticChild() {

        }).static({
            anotherStaticMethod: staticMethodTest
        });


        expect(typeof StaticChild.staticMethod === 'function').toBeTruthy();
        expect(typeof StaticChild.anotherStaticMethod === 'function').toBeTruthy();
        expect(StaticChild.anotherStaticMethod === staticMethodTest).toBeTruthy();
        StaticChild.anotherStaticMethod = function(){};//try overriding
        expect(StaticChild.anotherStaticMethod !== staticMethodTest).toBeTruthy();
        expect(StaticChild.STAT_A === 'a').toBeTruthy();
        StaticChild.STAT_A = 'c';
        expect(StaticChild.STAT_A === 'a').toBeTruthy();
        expect(StaticTest.STAT_A === 'a').toBeTruthy();
        StaticTest.staticMethod();
        expect(value).toEqual('a');

        var inst = new StaticChild();
        inst.doTest();

        expect(inst.value).toEqual('b');


    });

    it("Class.mixin", function() {
        var obj = {
            doA: function() {}
        };
        var obj2 = Class(function Obj() {
            var self = this;
            self.init2 = function() {
                this.inited2 = true;
            };

            self.doB = function() {
                this.doneB = true;
            };

            if (Obj.new) {
                self.init2();
            }
        });
        var obj3 = {};
        //watch out for this example in mixins! use only this keyword in mixins in order
        //to have non static variables
        var obj4 = obj2.extend(function Obj4() {
            var self = this;
            var _c;

            self.setC = function(val) {
                _c = val;
            };
            self.getC = function() {
                return _c;
            };
        });



        var MixinTest = Class(function MixinTest() {
            var self = this;

            self.init = function() {
                self.inited = true;
            };

            if (MixinTest.new) {
                self.init();
            }
        }).mixin(obj, obj2);

        var t = new MixinTest();

        expect(t['inited']).toBeTruthy();
        expect(t['inited2']).toBeUndefined();

        expect(t.typeOf(obj)).toBeTruthy();
        expect(t.typeOf(obj2)).toBeTruthy();
        expect(t.typeOf(obj3)).toBeFalsy();

        expect(typeof t['doA'] === 'function').toBeTruthy();
        expect(typeof t['doB'] === 'function').toBeTruthy();

        t.doB();

        expect(t['doneB']).toBeTruthy();



        var MixinTest2 = Class(function MixinTest2() {});
        MixinTest2.mixin(obj4, obj3);

        var t2 = new MixinTest2();

        expect(t2.typeOf(obj4)).toBeTruthy();

        expect(typeof t2['doB'] === 'function').toBeTruthy();
        expect(typeof t2['setC'] === 'function').toBeTruthy();
        expect(typeof t2['getC'] === 'function').toBeTruthy();


        var t3 = new MixinTest2();

        t3.setC('a');
        t2.setC('b');

        expect(t2.getC()).toEqual('b');
        expect(t3.getC()).toEqual('b');


    });



});