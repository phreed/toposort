export declare enum Mark {
    UNMARKED = 0,
    TEMPORARY = 1,
    PERMANENT = 2,
}
export declare class NodeMethods<T> {
    /**
     * Constuct a node given only the key.
     * Something like the inverse of keyFn.
     */
    nullNode(key: string): T | null;
    /**
     * The keyFn returns a key when passed a node.
     * an example for buildin a key given a number.
     * If the node should be dropped from the adjacency
     * list then undefined in returned.
     */
    keyFn<T>(node: T): string | null;
    /**
     * The depsFn returns the keys for a set of dependencies for a node.
     * An example for indexing a list of numbers
     * paired with an array of depencencies.
     */
    depsFn(node: T): string[];
    /**
     * The depsFn returns the keys for a set of dependencies for a node.
     */
    predsFn(node: T): string[];
    /**
     * This function is called when a cyclic dependency is located.
     * Generally you will want to save off the
     * offending node for special processing.
     */
    cycleFn(node: T): void;
}
export declare class AdjacencyNode<T> {
    constructor();
    constructor(node: T);
    mark: Mark;
    node: T[] | undefined;
    dep: AdjacencyNode<T>[];
    append(node: T | undefined): void;
}
export declare type AdjacencyList<T> = AdjacencyNode<T>[];
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
export declare function ConstructAdjacencyList<T>(list: T[], methods: NodeMethods<T>): AdjacencyList<T>;
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
export declare function Toposort<T>(nodes: T[], methods: NodeMethods<T>): T[];
