var merge = require('../../src/nc/util/merge');

describe('nc.util.merge',function() {

    var objects = [
        {a: 1},
        [1,2,3],
        {a: 1, b: 2, c: [1, 2, 3]},
        {a: 1, b: 2, c: [1, 2, 3], d: {a: 1, b: [1, 2]}},
        {a: 1, b: 2, c: [1, 2, 3], d: {a: 1, b: [1, 2]}},
        {a: 1, b: 2, c: [1, 2, 3], d: {a: 1, b: [1, 2]}},
        {a: [1,2]},
        {a: {a: 1, b: [1,2]}, c: {}}
    ];

    var sources = [
        {b: 1},
        [4,5,6],
        {c: [4,5,6], d: 5},
        {d : {b: [3, 4]}},
        {d : {b: [3, 4]}},
        {d : {b: [3, 4]}},
        {a: [3,4]},
        {a : {a: {}, b: [3,4]}, d: {}}
    ];

    var deep = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    ];

    var results = [
        {a: 1, b: 1},
        [1,2,3,4,5,6],
        {a: 1, b: 2, c: [1, 2, 3, 4, 5, 6], d: 5},
        {a: 1, b: 2, c: [1, 2, 3], d: {a: 1, b: [1, 2, 3, 4]}},
        {a: 1, b: 2, c: [1, 2, 3], d: {b: [3, 4]}},
        {a: 1, b: 2, c: [1, 2, 3], d: {a: 1, b: [3, 4]}},
        {a: [1,2,3,4]},
        {a: {a: {}, b: [1,2,3,4]}, c: {}, d: {}}
    ];




    it('merge', function() {

        /*for (var i = 0, j = objects.length; i < j; i++) {
            expect(merge(objects[i], sources[i], deep[i])).toEqual(results[i]);
        }*/

        //expect(merge(objects[1], sources[1])).toEqual(results[1]);
        expect(merge(objects[3], sources[3])).toEqual(results[3]);
        expect(merge(objects[5], sources[5],2)).toEqual(results[5]);
        //expect(merge(objects[6], sources[6])).toEqual(results[6]);
        //expect(merge(objects[7], sources[7])).toEqual(results[7]);


    });
});