import Fastify, {
  type FastifyInstance,
  FastifyRequest,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifySchema,
  RouteGenericInterface
} from "fastify";
import router from "../routes/index.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cors from "@fastify/cors";
import { fastifyPostgres } from "@fastify/postgres";
import { fastifyEnv } from "@fastify/env";

const server: FastifyInstance = Fastify({
  logger: { level: "trace" }
}).withTypeProvider<TypeBoxTypeProvider>();

type FastifyRequestTypebox<TSchema extends FastifySchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  TSchema,
  TypeBoxTypeProvider
>;

const envSchema = {
  type: "object",
  required: ["PORT", "SALT_ROUNDS"],
  properties: {
    PORT: {
      type: "string",
      default: "3001"
    },
    SALT_ROUNDS: {
      type: "string",
      default: "15"
    }
  }
};

const envOpts = {
  confKey: "config",
  schema: envSchema
};

const start = async () => {
  try {
    await server.register(fastifyPostgres, {
      user: "postgres",
      password: "postgrespw",
      database: "postgres",
      host: "localhost",
      port: 55000
    });

    // await server.register(fastifyEnv, envOpts);

    await server.register(cors, (instance) => async (req, callback) => {
      //   console.log(instance);
      const corsOptions = {
        credentials: true,
        allowedHeaders: ["Origin, X-Requested-With, Content-Type, Accept"],
        origin: false
      };
      // do not include CORS headers for requests from localhost
      const originHostname = req.headers.origin || req.ip || "";
      if (/(localhost|ngrok|127.0.0.1)/g.test(originHostname)) {
        corsOptions.origin = true;
      } else {
        corsOptions.origin = false;
      }
      callback(null, corsOptions); // callback expects two parameters: error and options
    });

    server.register(router);

    await server.listen({ port: 3001, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

export { start, server, type FastifyRequestTypebox };
