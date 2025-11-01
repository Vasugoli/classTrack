import { useEffect, useState } from "react";
import { useScheduleStore } from "@/store/scheduleStore";
import { useClassesStore } from "@/store/classesStore";
import toast from "react-hot-toast";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export default function Schedule() {
	const { schedules, loading, getSchedule, createSchedule, deleteSchedule } =
		useScheduleStore();
	const { classes, getClasses } = useClassesStore();
	const [showAddModal, setShowAddModal] = useState(false);
	const [formData, setFormData] = useState({
		classId: "",
		dayOfWeek: 1,
		startTime: "09:00",
		endTime: "10:00",
	});

	useEffect(() => {
		getSchedule();
		getClasses();
	}, [getSchedule, getClasses]);

	const handleAddSchedule = async (e: React.FormEvent) => {
		e.preventDefault();

		await createSchedule(formData);

		if (!useScheduleStore.getState().error) {
			toast.success("Schedule added successfully!");
			setShowAddModal(false);
			setFormData({
				classId: "",
				dayOfWeek: 1,
				startTime: "09:00",
				endTime: "10:00",
			});
		} else {
			toast.error(
				useScheduleStore.getState().error || "Failed to add schedule"
			);
		}
	};

	const handleDeleteSchedule = async (id: string) => {
		if (!confirm("Are you sure you want to delete this schedule?")) return;

		await deleteSchedule(id);

		if (!useScheduleStore.getState().error) {
			toast.success("Schedule deleted successfully!");
		} else {
			toast.error(
				useScheduleStore.getState().error || "Failed to delete schedule"
			);
		}
	};

	const getSchedulesByDay = () => {
		const byDay: { [key: number]: any[] } = {};

		for (let i = 0; i < 7; i++) {
			byDay[i] = schedules.filter((s: any) => s.dayOfWeek === i);
		}

		return byDay;
	};

	const schedulesByDay = getSchedulesByDay();
	const today = new Date().getDay();

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
				title='Schedule'
				subtitle='Your weekly class timetable'
				actions={
					<button
						onClick={() => setShowAddModal(true)}
						className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
						➕ Add Schedule
					</button>
				}
			/>

			{/* Weekly Schedule Grid */}
			<div className='grid grid-cols-1 gap-6'>
				{DAYS.map((day, index) => (
					<Card
						key={day}
						className={`${
							index === today ? "ring-2 ring-blue-500" : ""
						} overflow-hidden`}>
						<CardHeader
							className={`${
								index === today
									? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
									: "bg-gray-50"
							} px-6 py-4`}>
							<CardTitle>
								<span className='flex items-center gap-2'>
									{day}
									{index === today && (
										<span className='text-xs px-2 py-1 bg-white/20 rounded-full'>
											Today
										</span>
									)}
								</span>
							</CardTitle>
						</CardHeader>
						<CardBody>
							{schedulesByDay[index]?.length === 0 ? (
								<p className='text-gray-500 text-center py-4'>
									No classes scheduled
								</p>
							) : (
								<div className='space-y-3'>
									{schedulesByDay[index]?.map((schedule) => (
										<div
											key={schedule.id}
											className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between'>
											<div className='flex-1'>
												<h3 className='font-semibold text-gray-800'>
													{schedule.class.name}
												</h3>
												<p className='text-sm text-gray-600'>
													{schedule.class.code} • Room{" "}
													{schedule.class.room ||
														"TBA"}
												</p>
												<p className='text-sm font-medium text-blue-600 mt-1'>
													{schedule.startTime} -{" "}
													{schedule.endTime}
												</p>
											</div>
											<button
												onClick={() =>
													handleDeleteSchedule(
														schedule.id
													)
												}
												className='px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
												🗑️
											</button>
										</div>
									))}
								</div>
							)}
						</CardBody>
					</Card>
				))}
			</div>

			{/* Add Schedule Modal */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Add Schedule
						</h2>

						<form
							onSubmit={handleAddSchedule}
							className='space-y-4'>
							<div>
								<label
									htmlFor='classId'
									className='block text-sm font-medium text-gray-700 mb-2'>
									Class
								</label>
								<select
									id='classId'
									required
									value={formData.classId}
									onChange={(e) =>
										setFormData({
											...formData,
											classId: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									<option value=''>Select a class</option>
									{classes.map((cls) => (
										<option key={cls.id} value={cls.id}>
											{cls.name} ({cls.code})
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor='dayOfWeek'
									className='block text-sm font-medium text-gray-700 mb-2'>
									Day of Week
								</label>
								<select
									id='dayOfWeek'
									required
									value={formData.dayOfWeek}
									onChange={(e) =>
										setFormData({
											...formData,
											dayOfWeek: parseInt(e.target.value),
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									{DAYS.map((day, index) => (
										<option key={day} value={index}>
											{day}
										</option>
									))}
								</select>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Start Time
									</label>
									<input
										type='time'
										required
										title='Start time'
										placeholder='09:00'
										value={formData.startTime}
										onChange={(e) =>
											setFormData({
												...formData,
												startTime: e.target.value,
											})
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										End Time
									</label>
									<input
										type='time'
										required
										title='End time'
										placeholder='10:00'
										value={formData.endTime}
										onChange={(e) =>
											setFormData({
												...formData,
												endTime: e.target.value,
											})
										}
										className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
								</div>
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
									Add Schedule
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</Page>
	);
}
