# Microservice Example
This project demonstrates how to use subscriptions across services.

# Dependencies
1. Port 4000
2. [nats-server](https://github.com/nats-io/nats-server) @ 0.0.0.0:4222

# How to start
> Make sure nats server is running @0.0.0.0:4222

1. `npm install`
2. `npm run gateway`
3. `npm run user`
4. http://localhost:4000/graphql
