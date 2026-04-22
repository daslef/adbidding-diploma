require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

console.log("Starting database setup...");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

const AdSpot = sequelize.define(
  "AdSpot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    current_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    starting_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    reserve_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "ended"),
      defaultValue: "active",
    },
    total_bids: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estimated_views: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    season_duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "ad_spots",
    timestamps: true,
  }
);

const Bid = sequelize.define(
  "Bid",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ad_spot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ad_spots",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    is_highest_bid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "bids",
    timestamps: true,
  }
);

async function seedData() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      company_name: "AdTech Platform",
      role: "admin",
    });

    const userPassword = await bcrypt.hash("user123", 10);
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: userPassword,
      company_name: "Test Company",
      role: "user",
    });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2); // 2 months from now

    const adSpot = await AdSpot.create({
      title: "Premium Ad Spot",
      description: "A high-visibility ad spot for maximum exposure",
      current_price: 10000,
      starting_price: 10000,
      reserve_price: 15000,
      end_date: endDate,
      status: "active",
      total_bids: 0,
      image_url: "https://placehold.co/600x400/1e40af/FFFFFF",
      location: "Homepage",
      dimensions: "1200x300",
      event_count: 100,
      estimated_views: 50000,
      season_duration: "3 months",
      owner_id: admin.id,
    });

    await Bid.create({
      ad_spot_id: adSpot.id,
      user_id: user.id,
      amount: 10500,
      is_highest_bid: true,
    });

    console.log("Sample data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Sync all models (drop and recreate tables)
    await sequelize.sync();
    console.log("All tables created successfully");

    // Seed data
    await seedData();

    console.log("Database setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
