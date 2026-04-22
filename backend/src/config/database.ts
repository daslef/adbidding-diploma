import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();
const connectionString = process.env.DATABASE_URL!;

export const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  protocol: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
      console.log("Database models synchronized");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
