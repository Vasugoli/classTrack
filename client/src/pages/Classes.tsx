import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useClassesStore } from "@/store/classesStore";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody } from "@/components/ui/Card";

export default function Classes() {
	const user = useAuthStore((s) => s.user);
	const {
		classes,
		loading,
		getClasses,
		createClass,
		updateClass,
		deleteClass,
	} = useClassesStore();
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingClass, setEditingClass] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		code: "",
		teacherId: user?.id || "",
		room: "",
	});

	useEffect(() => {
		getClasses();
	}, [getClasses]);

	const handleAddClass = async (e: React.FormEvent) => {
		e.preventDefault();

		await createClass(formData);

		if (!useClassesStore.getState().error) {
			toast.success("Class created successfully!");
			setShowAddModal(false);
			setFormData({
				name: "",
				code: "",
				teacherId: user?.id || "",
				room: "",
			});
		} else {
			toast.error(
				useClassesStore.getState().error || "Failed to create class"
			);
		}
	};

	const handleEditClass = (cls: any) => {
		setEditingClass(cls);
		setFormData({
			name: cls.name,
			code: cls.code,
			teacherId: cls.teacherId,
			room: cls.room || "",
		});
		setShowEditModal(true);
	};

	const handleUpdateClass = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingClass) return;

		await updateClass(editingClass.id, {
			name: formData.name,
			code: formData.code,
			room: formData.room || undefined,
		});

		if (!useClassesStore.getState().error) {
			toast.success("Class updated successfully!");
			setShowEditModal(false);
			setEditingClass(null);
			setFormData({
				name: "",
				code: "",
				teacherId: user?.id || "",
				room: "",
			});
		} else {
			toast.error(
				useClassesStore.getState().error || "Failed to update class"
			);
		}
	};

	const handleDeleteClass = async (id: string) => {
		if (!confirm("Are you sure you want to delete this class?")) return;

		await deleteClass(id);

		if (!useClassesStore.getState().error) {
			toast.success("Class deleted successfully!");
		} else {
			toast.error(
				useClassesStore.getState().error || "Failed to delete class"
			);
		}
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
				title='Classes'
				subtitle='Manage all classes'
				actions={
					user?.role === "TEACHER" || user?.role === "ADMIN" ? (
						<button
							onClick={() => setShowAddModal(true)}
							className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
							➕ Create Class
						</button>
					) : null
				}
			/>

			{/* Classes Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{classes.length === 0 ? (
					<div className='col-span-full text-center py-12'>
						<p className='text-gray-500'>No classes found</p>
					</div>
				) : (
					classes.map((cls) => (
						<Card
							key={cls.id}
							className='hover:shadow-xl transition-all'>
							<CardBody>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex-1'>
										<h3 className='text-xl font-bold text-gray-800 mb-1'>
											{cls.name}
										</h3>
										<p className='text-sm text-gray-600'>
											Code: {cls.code}
										</p>
										{cls.room && (
											<p className='text-sm text-gray-600'>
												Room: {cls.room}
											</p>
										)}
									</div>

									{(user?.role === "TEACHER" ||
										user?.role === "ADMIN") && (
										<div className='flex gap-2'>
											<button
												onClick={() =>
													handleEditClass(cls)
												}
												className='text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors'
												title='Edit class'>
												✏️
											</button>
											<button
												onClick={() =>
													handleDeleteClass(cls.id)
												}
												className='text-red-600 hover:bg-red-50 p-2 rounded transition-colors'
												title='Delete class'>
												🗑️
											</button>
										</div>
									)}
								</div>

								<div className='pt-4 border-t border-gray-200'>
									<button className='w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium'>
										View Details
									</button>
								</div>
							</CardBody>
						</Card>
					))
				)}
			</div>

			{/* Add Class Modal */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Create New Class
						</h2>

						<form onSubmit={handleAddClass} className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Class Name
								</label>
								<input
									type='text'
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Data Structures'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Class Code
								</label>
								<input
									type='text'
									required
									value={formData.code}
									onChange={(e) =>
										setFormData({
											...formData,
											code: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='CS201'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Room (Optional)
								</label>
								<input
									type='text'
									value={formData.room}
									onChange={(e) =>
										setFormData({
											...formData,
											room: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Room 301'
								/>
							</div>

							<div className='flex gap-3 mt-6'>
								<button
									type='button'
									onClick={() => setShowAddModal(false)}
									className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
									Cancel
								</button>
								<button
									type='submit'
									className='flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
									Create Class
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Class Modal */}
			{showEditModal && editingClass && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Edit Class
						</h2>

						<form
							onSubmit={handleUpdateClass}
							className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Class Name
								</label>
								<input
									type='text'
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Data Structures'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Class Code
								</label>
								<input
									type='text'
									required
									value={formData.code}
									onChange={(e) =>
										setFormData({
											...formData,
											code: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='CS201'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Room (Optional)
								</label>
								<input
									type='text'
									value={formData.room}
									onChange={(e) =>
										setFormData({
											...formData,
											room: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Room 301'
								/>
							</div>

							<div className='flex gap-3 mt-6'>
								<button
									type='button'
									onClick={() => {
										setShowEditModal(false);
										setEditingClass(null);
									}}
									className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
									Cancel
								</button>
								<button
									type='submit'
									className='flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
									Update Class
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</Page>
	);
}
