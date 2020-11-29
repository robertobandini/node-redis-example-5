# node-redis-example-5

A Redlock example with Node.js about how to lock a key pair on Redis

In the previous example https://www.robertobandini.it/2020/11/22/testing-redis-high-concurrency-with-apachebench/ we’ve tested with ApacheBench an application deployed using Kubernetes and Docker, composed by a Node.js microservice to get and set key value pairs on Redis.
We saw that if we have many concurrent requests from multiple clients we can’t know before which will be the final value of the key on Redis.

In this example we see an example about how we can lock a key value pair on Redis, so that another client has to wait before to set a new value.
We will use the Node.js implementation of Redlock, the algorithm to have distributed locks with Redis.

You can find any information on this post: https://www.robertobandini.it/2020/11/29/a-redlock-example-with-node-js-about-how-to-lock-a-key-pair-on-redis/
