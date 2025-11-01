import { useEffect, useState } from "react";
import { useAuditStore } from "@/store/auditStore";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AuditLogs() {
	const user = useAuthStore((s) => s.user);
	const {
		logs,
		stats,
		loading,
		getAuditLogs,
		getAuditStats,
		exportAuditLogs,
		cleanupAuditLogs,
	} = useAuditStore();
	const [filterAction, setFilterAction] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	useEffect(() => {
		if (user?.role === "ADMIN") {
			loadAuditLogs();
			getAuditStats();
		}
	}, [user]);

	const loadAuditLogs = () => {
		const params: any = {};
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;
		if (filterAction) params.action = filterAction;

		getAuditLogs(params);
	};

	const handleExportLogs = async () => {
		toast.success("Exporting audit logs...");
		await exportAuditLogs();

		if (!useAuditStore.getState().error) {
			toast.success("Audit logs exported successfully!");
		} else {
			toast.error(
				useAuditStore.getState().error || "Failed to export logs"
			);
		}
	};

	const handleCleanupLogs = async () => {
		const daysOld = prompt("Delete logs older than how many days?", "90");
		if (!daysOld) return;

		if (
			!confirm(
				`Are you sure you want to delete audit logs older than ${daysOld} days? This cannot be undone.`
			)
		)
			return;

		await cleanupAuditLogs({
			daysOld: parseInt(daysOld),
		});

		if (!useAuditStore.getState().error) {
			toast.success("Old audit logs cleaned up successfully!");
			loadAuditLogs();
			getAuditStats();
		} else {
			toast.error(
				useAuditStore.getState().error || "Failed to cleanup logs"
			);
		}
	};

	const handleFilterChange = () => {
		loadAuditLogs();
	};

	if (user?.role !== "ADMIN") {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>🔒</div>
					<h2 className='text-2xl font-bold text-gray-800 mb-2'>
						Access Denied
					</h2>
					<p className='text-gray-600'>
						Only administrators can view audit logs
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	const actionTypes = [
		"LOGIN",
		"LOGOUT",
		"ATTENDANCE_ATTEMPT",
		"ATTENDANCE_SUCCESS",
		"DEVICE_BIND",
		"DEVICE_BIND_FAIL",
		"TOKEN_INVALID",
		"SUSPICIOUS_ACTIVITY",
	];

	return (
		<Page>
			<PageHeader
				title='Audit Logs'
				subtitle='Monitor system security and user activities'
				actions={
					<div className='flex gap-3'>
						<button
							onClick={handleExportLogs}
							className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
							📥 Export CSV
						</button>
						<button
							onClick={handleCleanupLogs}
							className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
							🗑️ Cleanup Old Logs
						</button>
					</div>
				}
			/>

			{/* Statistics Cards */}
			{stats && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg'>
						<div className='text-3xl mb-2'>📊</div>
						<p className='text-blue-100 text-sm'>Total Logs</p>
						<p className='text-3xl font-bold mt-1'>
							{stats.totalLogs.toLocaleString()}
						</p>
					</div>

					<div className='bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg'>
						<div className='text-3xl mb-2'>📅</div>
						<p className='text-green-100 text-sm'>Today's Logs</p>
						<p className='text-3xl font-bold mt-1'>
							{stats.todayLogs.toLocaleString()}
						</p>
					</div>

					<div className='bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg'>
						<div className='text-3xl mb-2'>⚠️</div>
						<p className='text-red-100 text-sm'>
							Suspicious Activities
						</p>
						<p className='text-3xl font-bold mt-1'>
							{stats.suspiciousActivities.toLocaleString()}
						</p>
					</div>

					<div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg'>
						<div className='text-3xl mb-2'>👥</div>
						<p className='text-purple-100 text-sm'>Unique Users</p>
						<p className='text-3xl font-bold mt-1'>
							{stats.uniqueUsers.toLocaleString()}
						</p>
					</div>
				</div>
			)}

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardBody>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
						<div>
							<label
								htmlFor='filterAction'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Action Type
							</label>
							<select
								id='filterAction'
								value={filterAction}
								onChange={(e) =>
									setFilterAction(e.target.value)
								}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
								<option value=''>All Actions</option>
								{actionTypes.map((action) => (
									<option key={action} value={action}>
										{action.replace(/_/g, " ")}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor='startDate'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Start Date
							</label>
							<input
								id='startDate'
								name='startDate'
								type='date'
								title='Start date filter'
								placeholder='YYYY-MM-DD'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label
								htmlFor='endDate'
								className='block text-sm font-medium text-gray-700 mb-2'>
								End Date
							</label>
							<input
								id='endDate'
								name='endDate'
								type='date'
								title='End date filter'
								placeholder='YYYY-MM-DD'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div className='flex items-end'>
							<button
								onClick={handleFilterChange}
								className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
								🔍 Apply Filters
							</button>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Action Breakdown */}
			{stats?.actionBreakdown && (
				<Card>
					<CardHeader>
						<CardTitle>Action Breakdown</CardTitle>
					</CardHeader>
					<CardBody>
						<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
							{Object.entries(stats.actionBreakdown).map(
								([action, count]) => (
									<div
										key={action}
										className='p-4 bg-gray-50 rounded-lg'>
										<p className='text-sm text-gray-600 font-medium'>
											{action.replace(/_/g, " ")}
										</p>
										<p className='text-2xl font-bold text-gray-800 mt-1'>
											{count}
										</p>
									</div>
								)
							)}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Audit Logs Table */}
			<Card className='overflow-hidden'>
				<CardHeader>
					<CardTitle>Audit Trail</CardTitle>
				</CardHeader>
				<CardBody className='p-0'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Timestamp
									</th>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										User
									</th>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Action
									</th>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Details
									</th>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										IP Address
									</th>
									<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
										Device
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{logs.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className='px-4 py-8 text-center text-gray-500'>
											No audit logs found
										</td>
									</tr>
								) : (
									logs.map((log) => (
										<tr
											key={log.id}
											className={`hover:bg-gray-50 ${
												log.action ===
												"SUSPICIOUS_ACTIVITY"
													? "bg-red-50"
													: ""
											}`}>
											<td className='px-4 py-3 text-sm'>
												{new Date(
													log.timestamp
												).toLocaleString()}
											</td>
											<td className='px-4 py-3 text-sm'>
												<div>
													<p className='font-medium'>
														{log.user?.name ||
															"N/A"}
													</p>
													<p className='text-xs text-gray-500'>
														{log.user?.email ||
															"N/A"}
													</p>
												</div>
											</td>
											<td className='px-4 py-3 text-sm'>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${
														log.action.includes(
															"SUCCESS"
														)
															? "bg-green-100 text-green-800"
															: log.action.includes(
																	"FAIL"
															  ) ||
															  log.action.includes(
																	"SUSPICIOUS"
															  )
															? "bg-red-100 text-red-800"
															: log.action.includes(
																	"LOGIN"
															  ) ||
															  log.action.includes(
																	"LOGOUT"
															  )
															? "bg-blue-100 text-blue-800"
															: "bg-gray-100 text-gray-800"
													}`}>
													{log.action.replace(
														/_/g,
														" "
													)}
												</span>
											</td>
											<td className='px-4 py-3 text-sm text-gray-600 max-w-xs truncate'>
												{log.details}
											</td>
											<td className='px-4 py-3 text-sm font-mono'>
												{log.ipAddress}
											</td>
											<td className='px-4 py-3 text-xs text-gray-500 max-w-xs truncate'>
												{log.deviceInfo}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardBody>
			</Card>

			{/* Security Notice */}
			<Card className='border-yellow-200'>
				<CardBody className='bg-yellow-50 rounded-2xl'>
					<h3 className='font-semibold text-yellow-800 mb-2 flex items-center gap-2'>
						🔐 Security & Compliance
					</h3>
					<ul className='space-y-2 text-sm text-yellow-700'>
						<li>
							• Audit logs are automatically generated for all
							security-sensitive actions
						</li>
						<li>
							• Suspicious activities are flagged and highlighted
							in red
						</li>
						<li>
							• Logs include IP address and device information for
							forensic analysis
						</li>
						<li>
							• Export logs regularly for compliance and backup
							purposes
						</li>
						<li>
							• Old logs can be cleaned up to manage database size
							(recommended: keep 90+ days)
						</li>
					</ul>
				</CardBody>
			</Card>
		</Page>
	);
}
