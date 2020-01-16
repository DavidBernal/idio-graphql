const { parseTypeDefs } = require("../../util/index.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");

const serve = require("./methods/serve.js");

const {
    IdioEnum,
    IdioInterface,
    IdioUnion
} = require("../appliances/index.js");

/**
 * @typedef {import('../appliances/index.js')} IdioEnum
 * @typedef {import('../idio-interface')} IdioInterface
 * @typedef {import('../idio-union.js')} IdioUnion
 */

/**
 * @callback PreHook
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

/**
 * @callback PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

/**
 * @typedef {(PostHook|Array.<PostHook>)} PreUnion
 */

/**
 * @typedef {(PreHook|Array.<PreHook>)} PostUnion
 */

/**
 * @typedef {Object} ResolverObjectInput
 * @property {Function} resolve - The resolver function.
 * @property {PreUnion} pre - Function(s) to call pre the resolve method.
 * @property {PostUnion} post - Function(s) to call post the resolve method.
 */

/**
 * @typedef {(ResolverObjectInput|Function)} ResolverUnion
 */

/**
 * @typedef {Object} ResolverType
 * @property {ResolverUnion} Query
 * @property {ResolverUnion} Mutation
 * @property {ResolverUnion} Subscription
 * @property {ResolverUnion} Fields
 */

/**
 * @typedef {(Function|any)} Injections
 */

/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {ResolverType} resolvers - Graphql resolvers
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 * @property {Array.<IdioInterface>} interfaces - The nodes interfaces.
 * @property {Array.<IdioUnion>} unions - The nodes unions.
 * @property {Injections} injections - Function/any to be passed as the last argument to each resolver.
 * @property {Array.<string>} dependencies - Used for microspace dependency coordination, specify what services (by name) to depend on.
 */

/**
 * @typedef {Object} GraphQLNodeConfig
 * @property {string} name - The nodes name.
 * @property {string} typeDefs - Graphql typeDefs, use filePath, string, or gql-tag
 * @property {ResolverType} resolvers - The nodes resolvers.
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 * @property {Array.<IdioInterface>} interfaces - The nodes interfaces.
 * @property {Array.<IdioUnion>} unions - The nodes unions.
 * @property {Injections} injections - Function/any to be passed as the last argument to each resolver.
 */

/**
 * Creates a instance of a GraphQLNode.
 *
 * @param {GraphQLNodeConfig} config - An object.
 *
 * @returns GraphQLNode
 */
function GraphQLNode({
    name,
    typeDefs,
    resolvers,
    enums,
    nodes,
    interfaces,
    unions,
    injections
} = {}) {
    const prefix = "constructing GraphQLNode";

    this.name;
    this.typeDefs;
    this.resolvers;
    this.enums;
    this.nodes;
    this.interfaces;
    this.unions;
    this.injections;
    this.serve;

    if (!name) {
        throw new IdioError(`${prefix}: name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix}: name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLocaleLowerCase()]) {
        throw new IdioError(
            `${prefix}: creating node '${name}' with invalid name.`
        );
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' Error: '${error}'.`);
    }

    if (!resolvers) {
        throw new IdioError(`${prefix}: '${name}' resolvers required.`);
    }

    const typeOfResolvers = typeof resolvers;

    if (typeOfResolvers !== "object") {
        throw new IdioError(
            `${prefix}: expected node: '${name}' resolvers to be of type 'object' but received '${typeOfResolvers}'.`
        );
    }

    const allowedResolvers = ["Query", "Mutation", "Subscription", "Fields"];

    const notAllowedResolvers = Object.keys(resolvers).filter(
        (key) => !allowedResolvers.includes(key)
    );

    if (notAllowedResolvers.length) {
        throw new IdioError(
            `${prefix}: '${name}' resolvers received unexpected properties '[ ${notAllowedResolvers.join(
                ", "
            )} ]'.`
        );
    }

    if (resolvers.Subscription) {
        Object.entries(resolvers.Subscription).forEach(([key, resolver]) => {
            if (!resolver.subscribe) {
                throw new IdioError(
                    `${prefix}: '${name}' resolvers.Subscription.${key} must contain a subscribe method`
                );
            }
        });
    }

    this.resolvers = resolvers;

    if (enums) {
        if (!Array.isArray(enums)) {
            throw new IdioError(
                `${prefix}: '${name}' enums must be of type 'array'.`
            );
        }

        function checkInstanceOfEnum(_enum) {
            if (!(_enum instanceof IdioEnum)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected enum to be instance of IdioEnum, received ${JSON.stringify(
                        _enum,
                        undefined,
                        2
                    )}.`
                );
            }
        }

        enums.forEach(checkInstanceOfEnum);

        this.enums = enums;
    }

    if (interfaces) {
        if (!Array.isArray(interfaces)) {
            throw new IdioError(
                `${prefix}: '${name}' interfaces must be of type 'array'.`
            );
        }

        function checkInstanceOfInterface(_interface) {
            if (!(_interface instanceof IdioInterface)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected interface to be instance of IdioInterface, received ${JSON.stringify(
                        _interface,
                        undefined,
                        2
                    )}.`
                );
            }
        }

        interfaces.forEach(checkInstanceOfInterface);

        this.interfaces = interfaces;
    }

    if (unions) {
        if (!Array.isArray(unions)) {
            throw new IdioError(
                `${prefix}: '${name}' unions must be of type 'array'.`
            );
        }

        function checkInstanceOfUnion(_union) {
            if (!(_union instanceof IdioUnion)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected interface to be instance of IdioUnion, received ${JSON.stringify(
                        _union,
                        undefined,
                        2
                    )}.`
                );
            }
        }

        unions.forEach(checkInstanceOfUnion);

        this.unions = unions;
    }

    if (nodes) {
        if (!Array.isArray(nodes)) {
            throw new IdioError(
                `${prefix}: '${name}' nodes must be of type 'array'.`
            );
        }

        function checkInstanceOfThis(node) {
            if (!(node instanceof GraphQLNode)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected node to be instance of GraphQLNode, received: '${JSON.stringify(
                        node,
                        undefined,
                        2
                    )}'.`
                );
            }
        }

        nodes.forEach(checkInstanceOfThis);

        this.nodes = nodes;
    }

    if (injections) {
        this.injections = injections;
    }
}

GraphQLNode.prototype.serve = serve(GraphQLNode);

module.exports = GraphQLNode;
