import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import { isJwtExpired } from "../../utils/jwt";

export default async function add(fastify: FastifyInstance) {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  localInstance.post(
    "/",
    {
      schema: {
        body: Type.Object({
          title: Type.String({ minLength: 3, maxLength: 40 }),
          content: Type.String({ minLength: 5, maxLength: 200 }),
          id: Type.String(),
          userName: Type.String()
        }),
        headers: Type.Object({
          authorization: Type.String()
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

      const { title, content, id, userName } = request.body;

      const { rows } = await localInstance.pg.query(
        `SELECT * FROM users WHERE "userName" = $1`,
        [userName]
      );

      if (rows.length === 0) {
        reply.code(404).send({
          message: "User not found"
        });
        return;
      }

      try {
        await localInstance.pg.query(
          `INSERT INTO posts (title, content, author_id, likes, "author_userName") VALUES ($1, $2, $3, $4, $5)`,
          [title, content, rows[0].id, {}, rows[0].userName]
        );
        reply.code(201).send({
          message: "Post created"
        });
      } catch (error) {
        reply.code(500).send({
          message: "Something went wrong"
        });
        console.log(error);
        return;
      }
    }
  );
}
