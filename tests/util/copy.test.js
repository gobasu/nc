var copy = require('../../src/nc/util/copy');
var copyPrimitive = require('../../src/nc/util/copyPrimitive');

describe('nc.util.copy',function() {

    it('copy', function() {
        var source = {
            a: 1,
            b: {
                a: 1,
                b : 2,
                c : {
                    a: 1,
                    b: 2,
                    c: 3
                }
            },
            f: false,
            c: [1,2,3,4, {a: 1, b: 2}]
        };

        var check = {
            a: 1,
            b: {
                a: 1,
                b : 2,
                c : {
                    a: 1,
                    b: 2,
                    c: 3
                }
            },
            f: false,
            c: [1,2,3,4, {a: 1, b: 2}]

        };

        var result = {
            a: 1,
            b: {
                a: 2,
                b : 2,
                c : {
                    a: 2,
                    b: 2,
                    c: 3
                }
            },
            f: false,
            c: [1,2,3,4, {a: 2, b: 2}, 5]

        };

        var cloned = copy(source);

        expect(cloned).toEqual(check);
        cloned.b.a = 2;
        cloned.b.c.a = 2;
        cloned.c.push(5);
        cloned.c[4].a = 2;

        expect(source).toEqual(check);
        expect(cloned).toEqual(result);


        var p = copy(result, 1);
        expect(p.a).toEqual(1);
        expect(p.f).toEqual(false);
        expect(p.b === undefined).toBeTruthy();
        expect(p.c === undefined).toBeTruthy();
    });

    it('copy- primitive', function() {
        var nonPrimitive = function(){};
        var source =  {
            boolean: true,
            number: 1,
            float: 1.0,
            array: [1,2,3],
            literal: {
                boolean: true,
                number: 1,
                float: 1.0,
                array: [1,2,3]
            },
            date: new Date(Date.now()),
            regex: new RegExp('\w'),
            nonPrimitive: new nonPrimitive()
        };

        var copied = copyPrimitive(source);

        expect(copied.boolean === true).toBeTruthy();
        expect(copied.number === 1).toBeTruthy();
        expect(copied.float === 1.0).toBeTruthy();
        expect(copied.array).toEqual([1,2,3]);
        expect(copied.literal).toEqual({boolean: true, number: 1, float: 1.0, array: [1,2,3]});
        expect(copied.nonPrimitive === undefined).toBeTruthy();
    });
});