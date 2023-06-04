import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import { compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../constants";
import { isJwtExpired } from "../utils/jwt";

const login = async (fastify: FastifyInstance) => {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  localInstance.post(
    "/",
    {
      schema: {
        body: Type.Object({
          email: Type.String({ minLength: 3, maxLength: 20 }),
          password: Type.String({ minLength: 8, maxLength: 20 })
        }),
        required: ["userName", "password"],
        additionalProperties: false
      }
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const { rows } = await localInstance.pg.query(
        `SELECT * FROM users WHERE "email" = $1`,
        [email]
      );

      if (rows.length === 0) {
        reply.code(404).send({
          message: "User not found"
        });
        return;
      }

      if (!compareSync(password, rows[0].password)) {
        reply.code(401).send({
          message: "Wrong password"
        });
        return;
      }

      const token = jwt.sign(
        {
          userId: rows[0].id,
          userName: rows[0].userName
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "60d"
        }
      );

      reply.code(200).send({
        message: "Login successful",
        token
      });
    }
  );
};

export default login;
