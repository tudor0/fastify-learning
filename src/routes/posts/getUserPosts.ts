import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import { isJwtExpired } from "../../utils/jwt";

export default async function getUserPosts(fastify: FastifyInstance) {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  localInstance.post(
    "/",
    {
      schema: {
        headers: Type.Object({
          authorization: Type.String()
        }),
        body: Type.Object({
          id: Type.String(),
          orderDirection: Type.Optional(Type.String({ enum: ["ASC", "DESC"] })),
          orderBy: Type.Optional(
            Type.String({ enum: ["title", "content", "likes", "created_at"] })
          )
        })
      }
    },
    async (request, reply) => {
      const authorizationHeader = request.headers.authorization?.replace(
        "Bearer ",
        ""
      );

      const isExp = isJwtExpired(authorizationHeader);

      if (!authorizationHeader || isExp) {
        reply.code(401).send({
          message: "Unauthorized"
        });
        return;
      }

      const { id, orderBy, orderDirection } = request.body;

      const { rows } = await localInstance.pg.query(
        `SELECT * FROM posts WHERE author_id = $1 ORDER BY ${
          orderBy || "created_at"
        } ${orderDirection || "DESC"}`,
        [id]
      );

      const data = rows;

      reply
        .code(200)
        .headers({ "content-type": "application/json" })
        .send(JSON.stringify(data));
    }
  );
}
