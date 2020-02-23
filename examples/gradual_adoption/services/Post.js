const { gql } = require("apollo-server");
const { GraphQLNode } = require("idio-graphql");

const { posts } = require("../../data/index.js");

const Post = new GraphQLNode({
    name: "Post",
    typeDefs: gql`
        type Post {
            id: String
            title: String
            likes: [User]
        }

        type Query {
            post(id: String!): Post
            posts(ids: [String]): [Post]
        }
    `,
    resolvers: {
        Query: {
            post: (root, { id }) => {
                return posts.find((x) => x.id === id);
            },
            posts: (root, { ids }) => {
                if (ids) {
                    return posts.filter((x) => ids.includes(x.id));
                }

                return posts;
            }
        },
        Fields: {
            likes: async (root, args, { injections }) => {
                const result = await injections.execute(
                    gql`
                        query($ids: [String]) {
                            users(ids: $ids) {
                                id
                                name
                                age
                            }
                        }
                    `,
                    {
                        variables: {
                            ids: root.likes
                        }
                    }
                );

                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                return result.data.users;
            }
        }
    }
});

async function main() {
    try {
        await Post.serve({
            gateway: "gateway",
            transporter: "NATS",
            logLevel: "info",
            heartbeatInterval: 3,
            heartbeatTimeout: 5
        });

        console.log("Post Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();