const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const { parseTypeDefs, validateTypeDefs } = require("../../util/index.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 * @typedef IdioUnion
 * @property {string} name
 * @property {Promise.<string>} typeDefs
 * @property {{__resolveType: () => string}} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise.<ServiceBroker>} serve
 */

/**
 * You can use IdioUnion to modularize an UnionTypeDefinition, together with its resolver.
 * You can specify unions 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioUnion}
 */
function IdioUnion({ name, resolver, typeDefs } = {}) {
    const prefix = "constructing IdioUnion";

    this.name;
    this.resolver;
    this.typeDefs;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== "string") {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' \n${error}.`);
    }

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: IdioUnion,
        kind: "UnionTypeDefinition",
        singular: "union",
        name: "unions"
    });

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without resolver.`);
    }

    if (!resolver.__resolveType) {
        throw new IdioError(
            `${prefix}: '${name}'.resolver must have a __resolveType property.`
        );
    }

    this.resolver = resolver;
}

IdioUnion.prototype.serve = serveAppliance({
    _Constructor: IdioUnion,
    kind: "UnionTypeDefinition",
    singular: "union",
    name: "unions"
});

module.exports = IdioUnion;
