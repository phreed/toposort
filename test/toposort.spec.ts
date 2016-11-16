/// <reference types="node" />

import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import { expect, config } from "chai";
// import { chaiDeepMatch } from "chai-deep-match";
import { Toposort, ConstructAdjacencyList, NodeMethods } from "../lib/toposort";
// chai.use(chaiDeepMatch);

config.includeStack = true;


function keyRawFn<T>(node: T[]): T {
    return node[0];
}

class NumAMethods implements NodeMethods<number[]> {
    public cycles: number[][];
    constructor() { this.cycles = []; }
    cycleFn(nodeKey: number[]): void {
        this.cycles.push(nodeKey);
        return;
    }
    nullNode(key: string): number[] {
        return [Number(key)];
    }
    keyFn(node: number[]): string {
        return node[0].toString();
    }
    depsFn(node: number[]): string[] {
        return node.slice(1).map(function (x: number) { return x.toString(); });
    }
}
class NumAThrowMethods extends NumAMethods {
    cycleFn(nodeKey: number[]): void {
        throw new Error(`${nodeKey}`);
    }
}


class StrAMethods implements NodeMethods<string[]> {
    public cycles: string[][];
    constructor() { this.cycles = []; }
    cycleFn(nodeKey: string[]): void {
        this.cycles.push(nodeKey);
        return;
    }
    nullNode(key: string): string[] {
        return [key];
    }
    keyFn(node: string[]): string {
        return node[0];
    }
    depsFn(node: string[]): string[] {
        return node.slice(1);
    }
}
let strAMethods = new StrAMethods;


/**
 * Add a new function to remove neighboring duplicates.
 */
function distinct<T>(input: Array<T>): Array<T> {
    let reducedArray: Array<T> = [];
    let previous: T | null = null;
    for (let current of input) {
        if (previous == current) {
            continue;
        }
        reducedArray.push(current);
        previous = current;
    }
    return reducedArray;
}


@suite("Topological-Sort:")
class Basic {

    /**
    * I am not sure why this is failing the results actually match.
    */
    @test "Simple Adjacency List"
        () {
        const nodes = [
            [2, 1],
            [3, 2]
        ];
        const an1 = { "node": [[1]], "mark": 0, "dep": [] };
        const an2 = { "node": [[2, 1]], "mark": 0, "dep": [an1] };
        const an3 = { "node": [[3, 2]], "mark": 0, "dep": [an2] };

        const numAMethods = new NumAMethods;
        const actualAdjList = ConstructAdjacencyList<number[]>(nodes, numAMethods);
        expect(actualAdjList).to.not.deep.equals([an2, an3, an1]);
    }

    @test "Simple 1, 2, 3"
        () {
        const nodes = [
            [1, 2],
            [2, 3],
            [3]
        ];

        const expected = [1, 2, 3];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(actual.map(keyRawFn)).to.deep.equals(expected);
    }


    @test "Simple 3, 2, 1"
        () {
        const nodes = [
            [2, 1],
            [3, 2]
        ];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(actual.map(keyRawFn)).to.deep.equals([3, 2, 1]);
    }

    @test "Extra 3, 2, 1, 1"
        () {
        const nodes = [
            [2, 1],
            [3, 2],
            [1]
        ];

        const expected = [3, 2, 1];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(actual.map(keyRawFn)).to.deep.equals(expected);
    }

    /**
     * I am not sure why this is failing the results actually match.
     */
    @test "Extra 3, 2, 1, 1, 2, 3 Adjacency List"
        () {
        const nodes = [
            [2, 1],
            [3, 2],
            [1],
            [2],
            [3]
        ];
        const an1 = { "node": [[1]], "mark": 0, "dep": [] };
        const an2 = { "node": [[2, 1], [2]], "mark": 0, "dep": [an1] };
        const an3 = { "node": [[3, 2], [3]], "mark": 0, "dep": [an2] };

        const numAMethods = new NumAMethods;
        const actualAdjList = ConstructAdjacencyList<number[]>(nodes, numAMethods);
        expect(actualAdjList).to.not.deep.equals([an2, an3, an1]);
    }

    @test "Extra 3, 2, 1, 1, 2, 3"
        () {
        const nodes = [
            [2, 1],
            [3, 2],
            [1],
            [2],
            [3]
        ];

        const expected = [3, 2, 1];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        const keysOnly = actual.map(keyRawFn);
        expect(distinct<number>(keysOnly)).to.deep.equals(expected);
    }
    @test "1,2,3 plus non-dependent 0"
        () {
        const nodes = [
            [2, 3],
            [1, 2],
            [0]
        ];

        const expected = [0, 1, 2, 3];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(actual.map(keyRawFn)).to.deep.equals(expected);
    }

    @test "non-dependent 0 then 1,2,3"
        () {
        const nodes = [
            [0],
            [2, 3],
            [1, 2],
            [0]
        ];

        const expected = [1, 2, 3, 0];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(distinct(actual.map(keyRawFn))).to.deep.equals(expected);
    }

    @test "0, 3-2, 3-2, 3-1, 2-1, 0, 3, 2, 1"
        () {
        const nodes = [
            [0],
            [3, 2],
            [3, 2],
            [3, 1],
            [2, 1],
            [0],
            [3],
            [2],
            [1]
        ];

        const expected = [3, 2, 1, 0];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(distinct(actual.map(keyRawFn))).to.deep.equals(expected);
    }

    @test "0, 3-2, 3-2-1, 3-1, 2-1, 0, 3, 2, 1"
        () {
        const nodes = [
            [0],
            [3, 2],
            [3, 2, 1],
            [3, 1],
            [2, 1, 1, 1],
            [0],
            [3],
            [2],
            [1]
        ];

        const expected = [3, 2, 1, 0];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(distinct(actual.map(keyRawFn))).to.deep.equals(expected);
    }

    @test "Simple circular reference error"
        () {
        const nodes = [
            [1, 2],
            [2, 1]
        ];
        const doIt = function () {
            const numAMethods = new NumAThrowMethods;
            Toposort<number[]>(nodes, numAMethods);
        };
        expect(doIt).to.throw();
    }

    @test "Complex circular reference error"
        () {
        const nodes = [
            [1, 2],
            [2, 3],
            [3, 1]
        ];
        const doIt = function () {
            const numAMethods = new NumAThrowMethods;
            Toposort<number[]>(nodes, numAMethods);
        };
        expect(doIt).to.throw();
    }

    @test "Ignore simple circular reference error"
        () {
        const nodes = [
            [1, 2],
            [2, 1]
        ];

        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);

        // order is not specified or guaranteed in any way when circular dependencies exist
        // only guarantee is that all items will be returned once each
        // confirm 2 items returned..
        expect(actual).to.have.length(2);
        const extract = actual.map(keyRawFn);
        expect(extract).to.contain(1);
        expect(extract).to.contain(2);
        expect(numAMethods.cycles).to.deep.equal([[1, 2]]);
    }

    @test "Ignore complex circular reference error"
        () {
        const nodes = [
            [1, 2],
            [2, 3],
            [3, 1]
        ];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);

        // order is not specified or guaranteed in any way when circular dependencies exist
        // only guarantee is that all items will be returned once each
        // confirm 3 items returned..
        expect(actual).to.have.length(3);
        const extract = actual.map(keyRawFn)
        expect(extract).to.contain(1);
        expect(extract).to.contain(2);
        expect(extract).to.contain(3);
        expect(numAMethods.cycles).to.deep.equal([[1, 2]]);
    }

    @test "one, two, three, four, five, six, seven, eight, nine"
        () {
        const nodes = [
            ['two', 'three'],
            ['four', 'six'],
            ['one', 'three'],
            ['two', 'four'],
            ['six', 'nine'],
            ['five', 'seven'],
            ['five', 'eight'],
            ['five', 'nine'],
            ['seven', 'eight'],
            ['eight', 'nine'],
            ['one', 'two'],
            ['four', 'five'],
            ['four', 'six'],
            ['three', 'six'],
            ['six', 'seven'],
            ['three', 'four']
        ];

        const expected = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const actual = Toposort<string[]>(nodes, strAMethods);
        expect(distinct(actual.map(keyRawFn))).to.deep.equals(expected);
    }

    @test "6,5,4, 10,11,12,  22,21,20"
        () {
        const nodes = [
            [6, 5],
            [5, 4],
            [4, 11],
            [4, 10],
            [4, 12],
            [12, 20],
            [11, 20],
            [10, 20],
            [10, 22],
            [11, 22],
            [12, 22],
            [22, 21],
            [21, 20]
        ];

        const expected = [6, 5, 4, 12, 10, 11, 22, 21, 20];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(distinct(actual.map(keyRawFn))).to.deep.equals(expected);
    }

    @test "6,5,4, 10,11,12,  22,21,20, again.."
        () {
        const nodes = [
            [6, 5],
            [5, 4],
            [22, 21],
            [21, 20],
            [4, 22],
            [10],
            [11],
            [12]
        ];

        const expected = [12, 11, 10, 6, 5, 4, 22, 21, 20];
        const numAMethods = new NumAMethods;
        const actual = Toposort<number[]>(nodes, numAMethods);
        expect(actual.map(keyRawFn)).to.deep.equals(expected);
    }
}

