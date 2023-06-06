import { type FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import register from "./register";
import login from "./login";
import posts from "./posts";

export default async function router(fastify: FastifyInstance): Promise<void> {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();
  localInstance.get(
    "/",
    {
      schema: {}
    },
    async (request, reply) => {
      const data = (await localInstance.pg.query("SELECT * FROM users")).rows;

      reply
        .code(200)
        .headers({ "content-type": "application/json" })
        .send(JSON.stringify(data));
    }
  );
  void fastify.register(register, {
    prefix: "/register"
  });
  void fastify.register(login, {
    prefix: "/login"
  });

  void fastify.register(posts, {
    prefix: "/posts"
  });
}
