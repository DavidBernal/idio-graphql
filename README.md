# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues)



Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels. 


```
$ npm install idio-graphql
```

# Docs 
https://danstarns.github.io/idio-graphql/

# Examples 

1. [RealWorld](https://github.com/danstarns/idio-graphql-realworld-example-app) - Node.js GraphQL example server built with modules, authentication, pagination, and more.
2. [RealWorld Microservice](https://github.com/danstarns/graphql-microservices-realworld-example-system) - Node.js powered distributed GraphQL schema built with modules, authentication, pagination, and more.
3. [Mini Examples](https://github.com/danstarns/idio-graphql/blob/master/examples/EXAMPLES.md) - Some smaller examples to help demonstrate the capability's of idio-graphql.

# Contributing 
https://github.com/danstarns/idio-graphql/blob/master/contributing.md

# Slack
https://idio-graphql.slack.com

# Quick Start
`$ npm install idio-graphql apollo-server graphql-tag`

Examples use **[apollo-server](https://www.npmjs.com/package/apollo-server)** however, feel free to plug into your own solution. 

```javascript
const {
    combineNodes,
    GraphQLNode
} = require("idio-graphql");

const { ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            age: Int
        }

        type Query {
            user(id: ID!): User
        }
    `,
    resolvers: {
        Query: {
            user: (parent, { id }) => { ... }
        }
    }
});

async function main() {
    const { typeDefs, resolvers } = combineNodes([ User ]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`http://localhost:4000/graphql`);
}

main();

```

# Microservices Quick Start

> Requires [nats-server](https://github.com/nats-io/nats-server) @ 0.0.0.0:4222

`$ npm install idio-graphql apollo-server graphql-tag moleculer nats`

## User Service

```javascript
const gql = require("graphql-tag");
const { GraphQLNode } = require("idio-graphql");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: String
            name: String
            age: Int
        }

        type Query {
            user(id: String!): User
            users(ids: [String]): [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => { ... },
            users: (root, { ids }, { injections: { broker } }) => { ... }
        }
    }
});

async function main() {
    try {
        await User.serve({
            gateway: "gateway",
            transporter: "NATS"
        });

        console.log("User Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
```

## Gateway Service

```javascript
const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("idio-graphql");

const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);

async function main() {
    try {
        const { typeDefs, resolvers } = await gateway.start();

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.listen(4000);

        console.log(`http://localhost:4000/graphql`);
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
```