import health from "./routes/health";
import auth from "./routes/auth";

// Admin routes
import users from "./routes/admin/users";
import vehicles from "./routes/admin/vehicles";
import parts from "./routes/admin/parts";
import services from "./routes/admin/services";
import serviceOrders from "./routes/admin/service-orders";

// Customer routes
import customerServiceOrders from "./routes/customer/service-orders";

// Billing service callbacks
import serviceOrderEvents from "./routes/service-order-events";

export default {
  health,
  auth,
  users,
  vehicles,
  parts,
  services,
  serviceOrders,
  customerServiceOrders,
  serviceOrderEvents,
};