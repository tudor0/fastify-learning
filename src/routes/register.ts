import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import * as bcrypt from "bcrypt";
import { JWT_SECRET_KEY, SALT_ROUNDS } from "../constants";
import jwt from "jsonwebtoken";

const salt = bcrypt.genSaltSync(SALT_ROUNDS);

const register = async (fastify: FastifyInstance): Promise<void> => {
  const localInstance = fastify.withTypeProvider<TypeBoxTypeProvider>();

  localInstance.post(
    "/",
    {
      schema: {
        body: Type.Object({
          userName: Type.String({ minLength: 3, maxLength: 20 }),
          password: Type.String({ minLength: 8, maxLength: 20 }),
          email: Type.String({ format: "email" }),
          firstName: Type.String({ minLength: 1, maxLength: 20 }),
          lastName: Type.String({ minLength: 1, maxLength: 20 })
        }),
        required: ["userName", "password", "email", "firstName", "lastName"],
        additionalProperties: false
      }
    },
    async (request, reply) => {
      const { userName, password, email, firstName, lastName } = request.body;

      const { rows } = await localInstance.pg.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (rows.length > 0) {
        reply.code(409).send({
          message: "User already exists"
        });
        return;
      }

      // Make this a separate function for a debounced check in the frontend form input
      try {
        const { rows: rows2 } = await localInstance.pg.query(
          `SELECT * FROM users WHERE "userName" = $1`,
          [userName]
        );

        if (rows2.length > 0) {
          reply.code(409).send({
            message: "Username already exists"
          });
          return;
        }
      } catch (err) {
        console.log("la userName verificare", err);
        return;
      }

      try {
        const hashedPassword = bcrypt.hashSync(password, salt);

        await localInstance.pg.query(
          `INSERT INTO users ("userName", password, email, "firstName", "lastName") VALUES ($1, $2, $3, $4, $5)`,
          [userName, hashedPassword, email, firstName, lastName]
        );

        const { rows: rows3 } = await localInstance.pg.query(
          `SELECT id FROM users WHERE "userName" = $1`,
          [userName]
        );

        const token = jwt.sign(
          {
            userId: rows3[0].id,
            userName: userName
          },
          JWT_SECRET_KEY,
          {
            expiresIn: "60d"
          }
        );

        reply.code(200).send({
          userName,
          email,
          firstName,
          lastName,
          token
        });
      } catch (err) {
        console.log(err);
        reply.code(500).send({
          message: "Something went wrong"
        });
      }
    }
  );
};

export default register;
