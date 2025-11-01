import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/deviceStore";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DeviceManagement() {
	const user = useAuthStore((s) => s.user);
	const {
		deviceInfo,
		bindings = [],
		getDeviceInfo,
		listDeviceBindings,
		bindDevice: bindDeviceAction,
		unbindDevice: unbindDeviceAction,
		validateCurrentDevice: validateDeviceAction,
	} = useDeviceStore();
	const [loading, setLoading] = useState(true);
	const [validating, setValidating] = useState(false);

	useEffect(() => {
		loadDeviceInfo();
		if (user?.role === "ADMIN") {
			loadAllDevices();
		}
	}, [user]);

	const loadDeviceInfo = async () => {
		await getDeviceInfo();
		setLoading(false);
	};

	const loadAllDevices = async () => {
		await listDeviceBindings();
	};

	// Helper to detect platform
	const getPlatform = (): string => {
		const ua = navigator.userAgent.toLowerCase();
		if (ua.includes("android")) return "Android";
		if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
		if (ua.includes("mac")) return "macOS";
		if (ua.includes("linux")) return "Linux";
		if (ua.includes("windows")) return "Windows";
		return "Unknown";
	};

	const handleBindDevice = async () => {
		// Detect platform and gather UA
		const platform = getPlatform();
		const userAgent = navigator.userAgent;

		// Additional entropy for fingerprinting
		const additionalEntropy = [
			navigator.language,
			screen.width + "x" + screen.height,
			new Date().getTimezoneOffset().toString(),
		].join("|");

		await bindDeviceAction({ userAgent, platform, additionalEntropy });

		if (!useDeviceStore.getState().error) {
			toast.success("Device bound successfully!");
			loadDeviceInfo();
		} else {
			toast.error(
				useDeviceStore.getState().error || "Failed to bind device"
			);
		}
	};

	const handleUnbindDevice = async () => {
		if (
			!confirm(
				"Are you sure you want to unbind this device? You won't be able to mark attendance from this device."
			)
		)
			return;

		await unbindDeviceAction();
		if (!useDeviceStore.getState().error) {
			toast.success("Device unbound successfully");
			loadDeviceInfo();
		} else {
			toast.error(
				useDeviceStore.getState().error || "Failed to unbind device"
			);
		}
	};

	const handleValidateDevice = async () => {
		setValidating(true);
		try {
			const ok = await validateDeviceAction();
			if (ok) {
				toast.success("Device is valid and bound!");
			} else {
				toast.error("Device is not bound or invalid!");
			}
		} catch (_e) {
			toast.error(
				useDeviceStore.getState().error || "Device validation failed"
			);
		} finally {
			setValidating(false);
		}
	};

	// Legacy helper removed; server handles hashing/fingerprinting

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	return (
		<Page>
			<PageHeader
				title='Device Management'
				subtitle='Manage device bindings for secure attendance'
			/>

			{/* Current Device Status */}
			<Card>
				<CardHeader>
					<CardTitle>Current Device Status</CardTitle>
				</CardHeader>
				<CardBody>
					{deviceInfo?.isBound ? (
						<div className='space-y-4'>
							<div className='flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200'>
								<div className='text-3xl'>✅</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-green-800'>
										Device Bound
									</h3>
									<p className='text-sm text-green-600'>
										This device is authorized for attendance
										marking
									</p>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='p-4 bg-gray-50 rounded-lg'>
									<p className='text-sm text-gray-600'>
										Device Hash
									</p>
									<p className='font-mono text-xs mt-1 break-all'>
										{deviceInfo.deviceHash}
									</p>
								</div>
								{/* Binding date not currently available in device info */}
							</div>

							<div className='flex gap-3'>
								<button
									onClick={handleValidateDevice}
									disabled={validating}
									className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'>
									{validating
										? "Validating..."
										: "🔍 Validate Device"}
								</button>
								<button
									onClick={handleUnbindDevice}
									className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
									🔓 Unbind Device
								</button>
							</div>
						</div>
					) : (
						<div className='space-y-4'>
							<div className='flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
								<div className='text-3xl'>⚠️</div>
								<div className='flex-1'>
									<h3 className='font-semibold text-yellow-800'>
										Device Not Bound
									</h3>
									<p className='text-sm text-yellow-600'>
										Bind this device to enable attendance
										marking
									</p>
								</div>
							</div>

							<button
								onClick={handleBindDevice}
								className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
								🔒 Bind This Device
							</button>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Admin: All Device Bindings */}
			{user?.role === "ADMIN" && (
				<Card>
					<CardHeader className='p-6 border-b border-gray-200/70 flex items-center justify-between'>
						<CardTitle>All Device Bindings</CardTitle>
						<button
							onClick={loadAllDevices}
							className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
							🔄 Refresh
						</button>
					</CardHeader>
					<CardBody className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											User
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Email
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Role
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Device Hash
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Bound On
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
											Last Used
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{bindings.length === 0 ? (
										<tr>
											<td
												colSpan={6}
												className='px-4 py-8 text-center text-gray-500'>
												No device bindings found
											</td>
										</tr>
									) : (
										bindings.map((device: any) => (
											<tr
												key={device.id}
												className='hover:bg-gray-50'>
												<td className='px-4 py-3 text-sm'>
													{device.user?.name || "N/A"}
												</td>
												<td className='px-4 py-3 text-sm'>
													{device.user?.email ||
														"N/A"}
												</td>
												<td className='px-4 py-3 text-sm'>
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															device.user
																?.role ===
															"ADMIN"
																? "bg-purple-100 text-purple-800"
																: device.user
																		?.role ===
																  "TEACHER"
																? "bg-blue-100 text-blue-800"
																: "bg-green-100 text-green-800"
														}`}>
														{device.user?.role ||
															"N/A"}
													</span>
												</td>
												<td className='px-4 py-3 text-xs font-mono'>
													{device.deviceHash.substring(
														0,
														16
													)}
													...
												</td>
												<td className='px-4 py-3 text-sm'>
													{new Date(
														device.bindingDate
													).toLocaleDateString()}
												</td>
												<td className='px-4 py-3 text-sm'>
													{new Date(
														device.lastUsed
													).toLocaleDateString()}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</CardBody>
				</Card>
			)}

			{/* Security Info */}
			<Card className='border-blue-200'>
				<CardBody className='bg-blue-50 rounded-2xl'>
					<h3 className='font-semibold text-blue-800 mb-2 flex items-center gap-2'>
						🔐 Security Information
					</h3>
					<ul className='space-y-2 text-sm text-blue-700'>
						<li>
							• Device binding ensures only authorized devices can
							mark attendance
						</li>
						<li>
							• Each user can bind one device at a time for
							security
						</li>
						<li>
							• Unbinding removes the device authorization
							immediately
						</li>
						<li>
							• Device hash is generated from browser fingerprint
						</li>
						{user?.role === "ADMIN" && (
							<li>
								• Admins can view all device bindings for
								monitoring
							</li>
						)}
					</ul>
				</CardBody>
			</Card>
		</Page>
	);
}
