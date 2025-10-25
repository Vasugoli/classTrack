import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateDeviceBindingRequest } from "../middleware/checkDeviceBinding";
import { auditLogger } from "../middleware/auditLogger";
import {
	bindDevice,
	getDeviceInfo,
	unbindDevice,
	listDeviceBindings,
	validateCurrentDevice
} from "../controllers/deviceController";

const router = Router();

/**
 * Device binding routes for secure attendance system
 * All routes require authentication
 */

// Bind a device to user account
// POST /api/device/bind
router.post(
	"/bind",
	requireAuth,
	auditLogger("DEVICE_BIND"),
	validateDeviceBindingRequest(),
	bindDevice
);

// Get device binding information for current user
// GET /api/device/info
router.get(
	"/info",
	requireAuth,
	getDeviceInfo
);

// Remove device binding (admin only)
// DELETE /api/device/unbind
router.delete(
	"/unbind",
	requireAuth,
	auditLogger("DEVICE_BIND_FAIL"), // Using this as there's no DEVICE_UNBIND action
	unbindDevice
);

// List all device bindings (admin only)
// GET /api/device/list
router.get(
	"/list",
	requireAuth,
	listDeviceBindings
);

// Validate current device against binding (utility endpoint)
// POST /api/device/validate
router.post(
	"/validate",
	requireAuth,
	validateCurrentDevice
);

export default router;