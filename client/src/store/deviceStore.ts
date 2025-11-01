// src/store/deviceStore.ts
import { create } from "zustand";
import * as deviceApi from "../lib/deviceApi";

interface DeviceBinding {
	id: string;
	deviceHash: string;
	userId: string;
	createdAt: string;
}

interface DeviceInfo {
	isBound: boolean;
	deviceHash?: string; // Optional, not always returned by /device/info
}

interface DeviceState {
	deviceInfo: DeviceInfo | null;
	bindings: DeviceBinding[];
	loading: boolean;
	error: string | null;
	bindDevice: (data: {
		userAgent: string;
		platform: string;
		additionalEntropy?: string;
	}) => Promise<void>;
	getDeviceInfo: () => Promise<void>;
	unbindDevice: () => Promise<void>;
	listDeviceBindings: () => Promise<void>;
	validateCurrentDevice: () => Promise<boolean>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
	deviceInfo: null,
	bindings: [],
	loading: false,
	error: null,

	bindDevice: async (data) => {
		set({ loading: true, error: null });
		try {
			await deviceApi.bindDevice(data);
			set({ loading: false });
		} catch (e: any) {
			set({ error: e.error || "Failed to bind device", loading: false });
		}
	},

	getDeviceInfo: async () => {
		set({ loading: true, error: null });
		try {
			const response = await deviceApi.getDeviceInfo();
			// Transform server response to UI-friendly shape
			const info: DeviceInfo = {
				isBound: response.status === "bound",
				// Server may not return deviceHash for single info; fall back to binding id
				deviceHash:
					response.binding?.deviceHash ||
					response.binding?.id ||
					undefined,
			};
			set({ deviceInfo: info, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch device info",
				loading: false,
			});
		}
	},

	unbindDevice: async () => {
		set({ loading: true, error: null });
		try {
			await deviceApi.unbindDevice();
			set({ deviceInfo: null, loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to unbind device",
				loading: false,
			});
		}
	},

	listDeviceBindings: async () => {
		set({ loading: true, error: null });
		try {
			const response = await deviceApi.listDeviceBindings();
			set({ bindings: response.bindings || [], loading: false });
		} catch (e: any) {
			set({
				error: e.error || "Failed to fetch device bindings",
				loading: false,
			});
		}
	},

	validateCurrentDevice: async () => {
		set({ loading: true, error: null });
		try {
			const result = await deviceApi.validateCurrentDevice();
			set({ loading: false });
			return result.isValid;
		} catch (e: any) {
			set({
				error: e.error || "Failed to validate device",
				loading: false,
			});
			return false;
		}
	},
}));
