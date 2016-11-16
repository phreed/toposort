/*
* @author Samuel Neff (https://github.com/samuelneff)
*
* based almost entirely on gist from
*
* @author SHIN Suzuki (shinout310@gmail.com)
*
 * https://gist.github.com/shinout/1232505
*/

/// <reference types="node" />
/// <reference types="core-js" />

export enum Mark {
    UNMARKED = 0,
    TEMPORARY = 1,
    PERMANENT = 2
}

export interface NodeMethods<T> {
    /**
     * Constuct a node given only the key.
     * Something like the inverse of keyFn.
     */
    nullNode(key: string): T;
    /**
     * The keyFn returns a key when passed a node.
     * an example for buildin a key given a number.
     */
    keyFn<T>(node: T): string;
    /**
     * The depsFn returns the keys for a set of dependencies for a node.
     * an example for indexing a list of numbers paired with an array of depencencies.
     */
    depsFn(node: T): string[];

    cycleFn(node: T): void;
}

export class AdjacencyNode<T> {
    constructor();
    constructor(node: T);
    constructor(node?: T) {
        this.mark = Mark.UNMARKED;
        this.node = [node];
        this.dep = [];
    }
    mark: Mark;
    node: T[] | undefined;
    dep: AdjacencyNode<T>[];
    append(node: T | undefined): void {
        if (typeof node === "undefined") { return; }
        this.node.push(node);
    }
}
export type AdjacencyList<T> = AdjacencyNode<T>[];

/**
 * Build a AdjacencyList of the form:
 * Given: 
 *   [[2,1], [3,2]]
 * Result:
 *  const an1 = { "node": [1], "mark": 0, "dep": [] };
 *  const an2 = { "node": [2, 1], "mark": 0, "dep": [an1] };
 *  const an3 = { "node": [3, 2], "mark": 0, "dep": [an2] };
 * [ an1, an2, an3 ]
 * 
 * The an1 adjacency node is added. 
 */
export function ConstructAdjacencyList<T>(list: T[], methods: NodeMethods<T>): AdjacencyList<T> {
    // Builds a map based on a key generated by 'keyFn'.
    let lookup = new Map<string, AdjacencyNode<T>>();
    list.forEach((node: T) => {
        let key = methods.keyFn(node);
        if (lookup.has(key)) {
            lookup.get(key).append(node);
        } else {
            lookup.set(key, new AdjacencyNode<T>(node));
        }
    })
    // Populate the dependancy array for each adjacency node.
    lookup.forEach((value) => {
        for (let depnode of value.node) {
            for (let depkey of methods.depsFn(depnode)) {
                let deprec = lookup.get(depkey);
                if (typeof deprec === "undefined") {
                    deprec = new AdjacencyNode<T>(methods.nullNode(depkey));
                    lookup.set(depkey, deprec);
                }
                // the dependency portion
                value.dep.push(deprec);
                // the predecessor
                // deprec.dep.push(value);
            }
        }
    })
    let result: AdjacencyList<T> = [];
    lookup.forEach((value): void => {
        if (typeof value === "undefined") { return; }
        result.push(value);
    });
    return result;
}

/**
 * Used by the topology sort when the input contains cycles.
 */
export interface CycleFn<T> {
    (node: T): void;
}


/**
 * General Topological Sort
 * 
 * https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 * 
 * while there are UNMARKED nodes:
 *   select an UNMARKED node N
 *   VISIT N
 * 
 * VISIT N
 *   if N has a TEMPORARY mark then you have a cycle
 *   if N is UNMARKED:
 *      TEMPORARY mark N
 *      for each dependency M of N:
 *         VISIT M
 *      PERMANENT mark N
 *      push N to L
 *
 * @param nodes : list of nodes
 *        The precise sort is, of course, not guaranteed.
 * @returns Array : topological sorted list of T's
 **/
export function Toposort<T>(nodes: T[], methods: NodeMethods<T>): T[] {

    let al = ConstructAdjacencyList<T>(nodes, methods);
    let result: T[] = [];
    const VISIT = (na: AdjacencyNode<T>): void => {
        if (na.mark === Mark.TEMPORARY) {
            na.node.forEach((node) => { methods.cycleFn(node); })
            return;
        }
        if (na.mark === Mark.PERMANENT) { return; }
        na.mark = Mark.TEMPORARY;
        if (typeof na.dep !== "undefined") {
            na.dep.forEach((ma) => { VISIT(ma); })
        }
        na.mark = Mark.PERMANENT;
        na.node.forEach((node) => { result.unshift(node); })
    }
    al.forEach((na) => { VISIT(na); });
    return result;
}
