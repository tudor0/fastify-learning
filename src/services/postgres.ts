import { Client } from "pg";

const client = new Client({
  host: "localhost",
  port: 55000,
  user: "postgres",
  password: "postgrespw"
});

const connectToPG = async () => {
  try {
    await client.connect();
    console.log("Connected to PG");
  } catch (err) {
    console.log("Error connecting to PG", err);
  }
};

export { connectToPG, client };
