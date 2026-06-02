import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes.js";
import supportersRoutes from "./modules/supporters/supporters.routes.js";
import offeringsRoutes from "./modules/offerings/offerings.routes.js";
import contactsRoutes from "./modules/contacts/contacts.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import expensesRoutes from "./modules/expenses/expenses.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

dotenv.config();

export const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/supporters", supportersRoutes);
app.use("/api/offerings", offeringsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/settings", settingsRoutes);

// Error handling
app.use(errorHandler);

// Standalone server boot
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
