import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const DATABASE_URL = process.env['DATABASE_URL']!;
const IS_DEVELOPMENT = process.env['NODE_ENV'] === "development"

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: IS_DEVELOPMENT ? console.log : false,
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
    console.log("Подключение к базе данных успешно");

    if (IS_DEVELOPMENT) {
      await sequelize.sync();
      console.log("Модели синхронизированы");
    }
  } catch (error) {
    console.error("Не удалось подключиться к базе данных:", error);
    throw error;
  }
};
