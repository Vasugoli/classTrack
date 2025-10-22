import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { usersAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface User {
	id: string;
	email: string;
	name: string;
	role: "STUDENT" | "TEACHER" | "ADMIN";
	enrollmentNo?: string;
	year?: number;
	branch?: string;
	createdAt: string;
}

export default function Users() {
	const currentUser = useAuthStore((s) => s.user);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState<
		"ALL" | "STUDENT" | "TEACHER" | "ADMIN"
	>("ALL");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
		null
	);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await usersAPI.listUsers();
			setUsers(res.data.users);
			setError("");
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	const handleRoleChange = async (
		userId: string,
		newRole: "STUDENT" | "TEACHER" | "ADMIN"
	) => {
		const loadingToast = toast.loading("Updating role...");
		try {
			await usersAPI.updateUserRole(userId, newRole);
			await fetchUsers();
			setEditingUser(null);
			setError("");
			toast.success("Role updated successfully!", { id: loadingToast });
		} catch (err: any) {
			const errorMsg =
				err.response?.data?.error || "Failed to update role";
			setError(errorMsg);
			if (err.response?.status === 403) {
				const permError =
					"You don't have permission to change user roles. Only admins can do this.";
				setError(permError);
				toast.error(permError, { id: loadingToast });
			} else {
				toast.error(errorMsg, { id: loadingToast });
			}
		}
	};

	const handleDeleteUser = async (userId: string) => {
		const loadingToast = toast.loading("Deleting user...");
		try {
			await usersAPI.deleteUser(userId);
			await fetchUsers();
			setShowDeleteConfirm(null);
			setError("");
			toast.success("User deleted successfully!", { id: loadingToast });
		} catch (err: any) {
			const errorMsg =
				err.response?.data?.error || "Failed to delete user";
			setError(errorMsg);
			if (err.response?.status === 403) {
				const permError =
					"You don't have permission to delete this user.";
				setError(permError);
				toast.error(permError, { id: loadingToast });
			} else {
				toast.error(errorMsg, { id: loadingToast });
			}
			setShowDeleteConfirm(null);
		}
	};

	const filteredUsers = users.filter(
		(u) => filter === "ALL" || u.role === filter
	);

	// Check if user can edit/delete based on role
	const canEditRole = () => {
		return currentUser?.role === "ADMIN";
	};

	const canDeleteUser = (user: User) => {
		// Can't delete yourself
		if (user.id === currentUser?.id) return false;

		// Teachers can only delete students
		if (currentUser?.role === "TEACHER") {
			return user.role === "STUDENT";
		}

		// Admins can delete teachers and students (but not other admins)
		if (currentUser?.role === "ADMIN") {
			return user.role !== "ADMIN";
		}

		return false;
	};

	// Get available filter options based on user role
	const getFilterOptions = () => {
		if (currentUser?.role === "TEACHER") {
			return ["ALL", "STUDENT"]; // Teachers only see students
		}
		if (currentUser?.role === "ADMIN") {
			return ["ALL", "STUDENT", "TEACHER"]; // Admins see students and teachers
		}
		return ["ALL", "STUDENT", "TEACHER", "ADMIN"];
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='flex flex-col items-center gap-4 animate-in'>
					<svg
						className='animate-spin h-12 w-12 text-blue-600'
						viewBox='0 0 24 24'>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
							fill='none'
						/>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
						/>
					</svg>
					<p className='text-lg font-medium text-gray-600'>
						Loading users...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-3'>
						<div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>👥</span>
						</div>
						<div>
							<h1 className='text-4xl font-bold text-gray-900'>
								User Management
							</h1>
							<p className='text-gray-600 mt-1'>
								{currentUser?.role === "TEACHER"
									? "Manage your students"
									: currentUser?.role === "ADMIN"
									? "Manage teachers and students"
									: "Manage all users in the system"}
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-start gap-3 animate-in shadow-sm'>
						<span className='text-xl'>⚠️</span>
						<div>
							<p className='font-medium'>{error}</p>
						</div>
					</div>
				)}

				{/* Filter Buttons */}
				<div className='mb-6 flex flex-wrap gap-2 animate-in'>
					{getFilterOptions().map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f as any)}
							className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
								filter === f
									? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
									: "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
							}`}>
							{f}
						</button>
					))}
				</div>

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-in'>
					<StatCard
						label='Total Users'
						value={users.length}
						icon='👥'
						color='blue'
					/>
					<StatCard
						label='Students'
						value={users.filter((u) => u.role === "STUDENT").length}
						icon='🎓'
						color='green'
					/>
					<StatCard
						label='Teachers'
						value={users.filter((u) => u.role === "TEACHER").length}
						icon='👨‍🏫'
						color='purple'
					/>
					<StatCard
						label='Admins'
						value={users.filter((u) => u.role === "ADMIN").length}
						icon='🔐'
						color='red'
					/>
				</div>

				{/* Users Table */}
				<div className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200'>
								<tr>
									<th className='px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Name
									</th>
									<th className='px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Email
									</th>
									<th className='px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Role
									</th>
									<th className='px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Enrollment/Info
									</th>
									<th className='px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Joined
									</th>
									<th className='px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-100'>
								{filteredUsers.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className='px-6 py-12 text-center'>
											<div className='flex flex-col items-center gap-3'>
												<span className='text-5xl'>
													🔍
												</span>
												<p className='text-lg font-medium text-gray-600'>
													No users found
												</p>
												<p className='text-sm text-gray-500'>
													Try adjusting your filters
												</p>
											</div>
										</td>
									</tr>
								) : (
									filteredUsers.map((user) => (
										<tr
											key={user.id}
											className='hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-150'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center gap-3'>
													<div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
														{user.name
															.charAt(0)
															.toUpperCase()}
													</div>
													<div className='font-semibold text-gray-900'>
														{user.name}
													</div>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
												{user.email}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{editingUser?.id === user.id ? (
													<select
														value={editingUser.role}
														onChange={(e) =>
															setEditingUser({
																...editingUser,
																role: e.target
																	.value as any,
															})
														}
														className='px-3 py-2 border-2 border-blue-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none'
														aria-label='User role'>
														<option value='STUDENT'>
															🎓 Student
														</option>
														<option value='TEACHER'>
															👨‍🏫 Teacher
														</option>
														<option value='ADMIN'>
															🔐 Admin
														</option>
													</select>
												) : (
													<span
														className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
															user.role ===
															"ADMIN"
																? "bg-gradient-to-r from-red-500 to-red-600 text-white"
																: user.role ===
																  "TEACHER"
																? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
																: "bg-gradient-to-r from-green-500 to-green-600 text-white"
														}`}>
														{user.role ===
															"ADMIN" && "🔐"}
														{user.role ===
															"TEACHER" && "👨‍🏫"}
														{user.role ===
															"STUDENT" && "🎓"}
														{user.role}
													</span>
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
												{user.enrollmentNo ||
													user.branch ||
													"-"}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
												{new Date(
													user.createdAt
												).toLocaleDateString()}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
												{user.id === currentUser?.id ? (
													<span className='px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold'>
														You
													</span>
												) : editingUser?.id ===
												  user.id ? (
													<div className='flex gap-2 justify-end'>
														<button
															onClick={() =>
																handleRoleChange(
																	user.id,
																	editingUser.role
																)
															}
															className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-sm'>
															✓ Save
														</button>
														<button
															onClick={() =>
																setEditingUser(
																	null
																)
															}
															className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors'>
															✕ Cancel
														</button>
													</div>
												) : (
													<div className='flex gap-2 justify-end'>
														{canEditRole() && (
															<button
																onClick={() =>
																	setEditingUser(
																		user
																	)
																}
																className='px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold transition-all duration-200 hover:shadow-md'>
																✏️ Edit
															</button>
														)}
														{canDeleteUser(
															user
														) && (
															<button
																onClick={() =>
																	setShowDeleteConfirm(
																		user.id
																	)
																}
																className='px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-all duration-200 hover:shadow-md'>
																🗑️ Delete
															</button>
														)}
														{!canEditRole() &&
															!canDeleteUser(
																user
															) && (
																<span className='px-3 py-1.5 bg-gray-100 text-gray-400 rounded-full text-xs font-semibold'>
																	No Actions
																</span>
															)}
													</div>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in'>
						<div className='bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in'>
							<div className='text-center mb-6'>
								<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
									<span className='text-3xl'>🗑️</span>
								</div>
								<h3 className='text-2xl font-bold text-gray-900 mb-2'>
									Confirm Delete
								</h3>
								<p className='text-gray-600'>
									Are you sure you want to delete this user?
									This action cannot be undone.
								</p>
							</div>
							<div className='flex gap-3'>
								<button
									onClick={() => setShowDeleteConfirm(null)}
									className='flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200'>
									Cancel
								</button>
								<button
									onClick={() =>
										handleDeleteUser(showDeleteConfirm)
									}
									className='flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold shadow-lg transition-all duration-200'>
									Delete
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
	color,
}: {
	label: string;
	value: number;
	icon: string;
	color: "blue" | "green" | "purple" | "red";
}) {
	const colors = {
		blue: "from-blue-500 to-blue-600",
		green: "from-green-500 to-green-600",
		purple: "from-purple-500 to-purple-600",
		red: "from-red-500 to-red-600",
	};

	return (
		<div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm font-medium text-gray-600 mb-1'>
						{label}
					</p>
					<p className='text-3xl font-bold text-gray-900'>{value}</p>
				</div>
				<div
					className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}>
					<span className='text-2xl'>{icon}</span>
				</div>
			</div>
		</div>
	);
}
