/* eslint-disable import/no-dynamic-require */
const { SOURCE_PATH = "../../src" } = process.env;
const { expect } = require("chai");

const { GraphQLNode, combineNodes } = require(SOURCE_PATH);

describe("gists/field-resolvers", async () => {
    it("should verify field-resolvers", async () => {
        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
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
                    user: () => true
                }
            }
        });

        const Post = new GraphQLNode({
            name: "Post",
            typeDefs: `
                type Post {
                    id: ID
                    title: String
                    content: Int
                    user: User
                }
                
                type Query {
                    post(id: ID!): Post
                }
            `,
            resolvers: {
                Query: {
                    post: () => true
                },
                Fields: {
                    user: () => true
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User, Post]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Post");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers).to.be.a("object");

        expect(resolvers.Query).to.be.a("object");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Post")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.be.a("object")
            .to.have.property("post")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");
    });
});
