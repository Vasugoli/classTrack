import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUsersStore } from "@/store/usersStore";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody } from "@/components/ui/Card";

export default function Users() {
	const { users, loading, getAllUsers, updateUserRole, deleteUser } =
		useUsersStore();
	const [filter, setFilter] = useState<
		"ALL" | "STUDENT" | "TEACHER" | "ADMIN"
	>("ALL");

	useEffect(() => {
		getAllUsers();
	}, [getAllUsers]);

	const handleUpdateRole = async (userId: string, newRole: string) => {
		await updateUserRole(userId, newRole);

		if (!useUsersStore.getState().error) {
			toast.success("User role updated successfully!");
		} else {
			toast.error(
				useUsersStore.getState().error || "Failed to update role"
			);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) return;

		await deleteUser(userId);

		if (!useUsersStore.getState().error) {
			toast.success("User deleted successfully!");
		} else {
			toast.error(
				useUsersStore.getState().error || "Failed to delete user"
			);
		}
	};

	const filteredUsers =
		filter === "ALL" ? users : users.filter((u) => u.role === filter);

	const stats = {
		total: users.length,
		students: users.filter((u) => u.role === "STUDENT").length,
		teachers: users.filter((u) => u.role === "TEACHER").length,
		admins: users.filter((u) => u.role === "ADMIN").length,
	};

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
				title='Users Management'
				subtitle='Manage all system users'
			/>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
				<div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Total Users</p>
					<p className='text-3xl font-bold'>{stats.total}</p>
				</div>
				<div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Students</p>
					<p className='text-3xl font-bold'>{stats.students}</p>
				</div>
				<div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Teachers</p>
					<p className='text-3xl font-bold'>{stats.teachers}</p>
				</div>
				<div className='bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Admins</p>
					<p className='text-3xl font-bold'>{stats.admins}</p>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<span className='text-sm font-medium text-gray-700'>
							Filter:
						</span>
						{(["ALL", "STUDENT", "TEACHER", "ADMIN"] as const).map(
							(f) => (
								<button
									key={f}
									onClick={() => setFilter(f)}
									className={`px-4 py-2 rounded-lg font-medium transition-all ${
										filter === f
											? "bg-blue-600 text-white shadow-md"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}>
									{f}
								</button>
							)
						)}
					</div>
				</CardBody>
			</Card>

			{/* Users Table */}
			<Card className='overflow-hidden'>
				<div className='overflow-x-auto'>
					{filteredUsers.length === 0 ? (
						<p className='text-gray-500 text-center py-12'>
							No users found
						</p>
					) : (
						<table className='w-full'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Name
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Email
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Enrollment
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Role
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{filteredUsers.map((user) => (
									<tr
										key={user.id}
										className='hover:bg-gray-50 transition-colors'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='font-medium text-gray-900'>
												{user.name}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
											{user.email}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
											{user.enrollmentNo || "N/A"}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<select
												title='Role'
												aria-label='Role'
												value={user.role}
												onChange={(e) =>
													handleUpdateRole(
														user.id,
														e.target.value
													)
												}
												className='px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
												<option value='STUDENT'>
													STUDENT
												</option>
												<option value='TEACHER'>
													TEACHER
												</option>
												<option value='ADMIN'>
													ADMIN
												</option>
											</select>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm'>
											<button
												onClick={() =>
													handleDeleteUser(user.id)
												}
												className='text-red-600 hover:text-red-800 font-medium'>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</Card>
		</Page>
	);
}
