/* eslint-disable prettier/prettier */
const { loadNode } = require("../../graphql_node/methods/index.js");
const { execute } = require("../../../util/index.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {GraphQLNode[]} nodes
 */

/**
 *  @typedef reducedNodes
 *  @property {string[]} typeDefs
 *  @property {object} resolvers
 */

function inject(methods, RUNTIME) {
    return Object.entries(methods).reduce((result, [key, method]) => {
        const func = (_method, graphQLArgs) => {
            const newArgs = [...graphQLArgs];

            if (!newArgs[CONTEXT_INDEX]) {
                newArgs[CONTEXT_INDEX] = {};
            }

            if (!newArgs[CONTEXT_INDEX].injections) {
                newArgs[CONTEXT_INDEX].injections = {};
            }

            if (!(typeof newArgs[CONTEXT_INDEX].injections === "object")) {
                newArgs[CONTEXT_INDEX].injections = {};
            }

            newArgs[CONTEXT_INDEX].injections = {
                ...newArgs[CONTEXT_INDEX].injections,
                execute: execute.withSchema(RUNTIME.schema)
            };

            return _method(...newArgs);
        };

        return {
            ...result,
            ...(method.subscribe
                ? {
                    [key]: {
                        ...method,
                        subscribe: (...graphQLArgs) =>
                            func(method.subscribe, ...graphQLArgs)
                    }
                }
                : {
                    [key]: (...graphQLArgs) => func(method, ...graphQLArgs)
                })
        };
    }, {});
}

/**
 *
 * @param {reducedNodes} r
 * @param {GraphQLNode} node
 */
function reduceNode(r, node, RUNTIME) {
    let { ...result } = r;

    result.typeDefs.push(node.typeDefs);

    result.resolvers = {
        ...result.resolvers,
        ...Object.entries(node.resolvers)
            .filter(([key]) => key !== "Fields")
            .reduce(
                (res, [key, methods]) => ({
                    ...res,
                    ...(result.resolvers[key]
                        ? {
                            [key]: {
                                ...result.resolvers[key],
                                ...inject(methods, RUNTIME)
                            }
                        }
                        : { [key]: inject(methods, RUNTIME) })
                }),
                {}
            ),
        ...(node.resolvers.Fields ? { [node.name]: node.resolvers.Fields } : {})
    };

    if (node.nodes) {
        const {
            resolvers: nestedResolvers,
            typeDefs: nestedTypeDefs
        } = node.nodes
            .map(loadNode)
            .reduce((_result, _node) => reduceNode(_result, _node, RUNTIME), {
                typeDefs: [],
                resolvers: {}
            });

        result = {
            ...result,
            typeDefs: [...result.typeDefs, ...nestedTypeDefs],
            resolvers: Object.entries(result.resolvers).reduce(
                (res, [key, value]) => ({
                    ...res,
                    ...(nestedResolvers[key]
                        ? { [key]: { ...nestedResolvers[key], ...value } }
                        : { [key]: value })
                }),
                {}
            )
        };
    }

    return result;
}

/**
 * @param {nodes} nodes
 * @returns {reducedNodes}
 */
function reduceNodes(nodes, RUNTIME) {
    return nodes
        .map(loadNode)
        .reduce((result, node) => reduceNode(result, node, RUNTIME), {
            typeDefs: [],
            resolvers: {}
        });
}

module.exports = reduceNodes;
