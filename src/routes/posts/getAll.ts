import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";

export default async function getAll(fastify: FastifyInstance) {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  localInstance.get("/", async (request, reply) => {
    const data = (await localInstance.pg.query("SELECT * FROM posts")).rows;

    reply
      .code(200)
      .headers({ "content-type": "application/json" })
      .send(JSON.stringify(data));
  });
}
