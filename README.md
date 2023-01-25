# Demo: Dockerized app for deployment and development

Docker is a platform for packaging app code and all dependencies together in a container, a lightweight OS virtualizations that can run on any machine that has Docker installed.

For devs, this enables us to define one "host" with locked specifications for the app to run on. Instead of every dev ensuring that they have the right Node/Python/Node/toolchain version on their local, they can simply run the Docker container. All dependencies defined in the Dockerfile will be installed in the container image.

### Dockerfile

A Dockerfile defines the platforms, dependencies, and commands needed to build the container image. Once the image is built from the Dockerfile, all the needed files, deps and commands are installed and ready to be used once you run the container from the image.

An image is a blueprint for the virtual environment, and a container is a running instance of that image. We've turned the "computer" on and it's running the commands we told it to run. In our case, it's serving our nextjs app.

### docker-compose

Docker compose configures and orchestrates containers. In this example, serving locally with `npm run dev` required a bit more configuration than the production-ready server so I defined the service in docker-compose.yml

### Running the container, two ways

In the project root, run the following commands:

    COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build

    docker-compose up

This will build and launch the container for local development defined by `Dockerfile` and `docker-compose.yml`. You can press ctrl-C to shut down the container

To build and launch a production-ready server:

    docker build -t docker-demo -f prod.Dockerfile .

    docker run -p 3000:3000 docker-demo

This builds and runs the container directly, without orchestration/configuration from compose.

# What is this app?

An example I found and cloned with `npx create-next-app --example api-routes api-routes-app` to get an example of modern NextJs project setup. We may not structure our project like this, but I can make a Dockerfile that fits our structure and hopefully should consistently work without needing to be changed often. 

Here is Next's blurb about this app:

> Next.js ships with [API routes](https://nextjs.org/docs/api-routes/introduction) which provides an easy solution to build your own `API`. This example shows how to create multiple `API` endpoints with serverless functions, which can execute independently.

