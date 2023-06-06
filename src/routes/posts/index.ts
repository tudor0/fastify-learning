import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import getAll from "./getAll";
import add from "./add";
import getUserPosts from "./getUserPosts";

export default async function posts(fastify: FastifyInstance) {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  void fastify.register(getAll, {
    prefix: "/getAll"
  });

  void fastify.register(add, {
    prefix: "/add"
  });

  void fastify.register(getUserPosts, {
    prefix: "/getUserPosts"
  });
}
