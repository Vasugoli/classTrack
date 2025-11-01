import { useEffect, useState } from "react";
import {
	useProductivityStore,
	type Task,
	type Suggestion,
} from "@/store/productivityStore";
import toast from "react-hot-toast";
import { Page, PageHeader } from "@/components/ui/Page";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Productivity() {
	const {
		tasks,
		suggestions,
		loading,
		getTasks,
		getSuggestions,
		createTask,
		updateTask,
		deleteTask,
	} = useProductivityStore();
	const [showAddModal, setShowAddModal] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "academic",
		priority: 3,
		dueDate: "",
	});

	useEffect(() => {
		getTasks();
		getSuggestions();
	}, [getTasks, getSuggestions]);

	const handleAddTask = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload: any = {
			title: formData.title,
			category: formData.category,
			priority: formData.priority,
		};

		if (formData.description) payload.description = formData.description;
		if (formData.dueDate)
			payload.dueDate = new Date(formData.dueDate).toISOString();

		await createTask(payload);

		if (!useProductivityStore.getState().error) {
			toast.success("Task added successfully!");
			setShowAddModal(false);
			setFormData({
				title: "",
				description: "",
				category: "academic",
				priority: 3,
				dueDate: "",
			});
		} else {
			toast.error(
				useProductivityStore.getState().error || "Failed to add task"
			);
		}
	};

	const handleToggleTask = async (taskId: string, completed: boolean) => {
		await updateTask(taskId, { completed: !completed });

		if (!useProductivityStore.getState().error) {
			toast.success(completed ? "Task reopened!" : "Task completed!");
		} else {
			toast.error(
				useProductivityStore.getState().error || "Failed to update task"
			);
		}
	};

	const handleDeleteTask = async (taskId: string) => {
		if (!confirm("Are you sure you want to delete this task?")) return;

		await deleteTask(taskId);

		if (!useProductivityStore.getState().error) {
			toast.success("Task deleted successfully!");
		} else {
			toast.error(
				useProductivityStore.getState().error || "Failed to delete task"
			);
		}
	};

	const handleAddSuggestionAsTask = async (suggestion: Suggestion) => {
		await createTask({
			title: suggestion.title,
			description: suggestion.description,
			category: suggestion.category,
			priority: suggestion.priority || 3,
		});

		if (!useProductivityStore.getState().error) {
			toast.success("Added to your task list!");
		} else {
			toast.error(
				useProductivityStore.getState().error || "Failed to add task"
			);
		}
	};

	const pendingTasks = tasks.filter((t: any) => !t.completed);
	const completedTasks = tasks.filter((t: any) => t.completed);

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
				title='Productivity'
				subtitle='Manage tasks and get AI-powered suggestions'
				actions={
					<button
						onClick={() => setShowAddModal(true)}
						className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
						➕ Add Task
					</button>
				}
			/>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Total Tasks</p>
					<p className='text-3xl font-bold'>{tasks.length}</p>
				</div>
				<div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Pending</p>
					<p className='text-3xl font-bold'>{pendingTasks.length}</p>
				</div>
				<div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg'>
					<p className='text-white/80 text-sm mb-1'>Completed</p>
					<p className='text-3xl font-bold'>
						{completedTasks.length}
					</p>
				</div>
			</div>

			{/* AI Suggestions */}
			{suggestions.length > 0 && (
				<div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200'>
					<h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
						🤖 AI Suggestions for You
					</h2>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{suggestions.map((suggestion, index) => (
							<div
								key={index}
								className='bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
								<div className='flex items-start justify-between mb-2'>
									<h3 className='font-semibold text-gray-800 flex-1'>
										{suggestion.title}
									</h3>
									<span className='text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded'>
										{suggestion.category}
									</span>
								</div>
								{suggestion.description && (
									<p className='text-sm text-gray-600 mb-3'>
										{suggestion.description}
									</p>
								)}
								<button
									onClick={() =>
										handleAddSuggestionAsTask(suggestion)
									}
									className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
									+ Add to Tasks
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Pending Tasks */}
			<Card>
				<CardHeader>
					<CardTitle>📋 Pending Tasks</CardTitle>
				</CardHeader>
				<CardBody>
					{pendingTasks.length === 0 ? (
						<p className='text-gray-500 text-center py-8'>
							No pending tasks. Add a new task to get started!
						</p>
					) : (
						<div className='space-y-3'>
							{pendingTasks.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									onToggle={handleToggleTask}
									onDelete={handleDeleteTask}
								/>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* Completed Tasks */}
			{completedTasks.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>✅ Completed Tasks</CardTitle>
					</CardHeader>
					<CardBody>
						<div className='space-y-3'>
							{completedTasks.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									onToggle={handleToggleTask}
									onDelete={handleDeleteTask}
								/>
							))}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Add Task Modal */}
			{showAddModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-xl p-8 max-w-md w-full'>
						<h2 className='text-2xl font-bold text-gray-800 mb-4'>
							Add New Task
						</h2>

						<form onSubmit={handleAddTask} className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Title
								</label>
								<input
									type='text'
									required
									title='Task title'
									placeholder='Complete assignment'
									value={formData.title}
									onChange={(e) =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Description (Optional)
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									rows={3}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Add details...'
								/>
							</div>

							<div>
								<label
									htmlFor='category'
									className='block text-sm font-medium text-gray-700 mb-2'>
									Category
								</label>
								<select
									id='category'
									value={formData.category}
									onChange={(e) =>
										setFormData({
											...formData,
											category: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
									<option value='academic'>Academic</option>
									<option value='career'>Career</option>
									<option value='skill'>
										Skill Development
									</option>
									<option value='personal'>Personal</option>
								</select>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Priority (1-5)
								</label>
								<input
									type='number'
									min='1'
									max='5'
									title='Task priority between 1 and 5'
									placeholder='3'
									value={formData.priority}
									onChange={(e) =>
										setFormData({
											...formData,
											priority: parseInt(e.target.value),
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Due Date (Optional)
									</label>
									<input
										type='date'
										title='Task due date'
										value={formData.dueDate}
										onChange={(e) =>
											setFormData({
												...formData,
												dueDate: e.target.value,
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
									Add Task
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</Page>
	);
}

function TaskCard({
	task,
	onToggle,
	onDelete,
}: {
	task: Task;
	onToggle: (id: string, completed: boolean) => void;
	onDelete: (id: string) => void;
}) {
	const priorityColors = ["gray", "blue", "green", "yellow", "orange", "red"];
	const priorityColor = priorityColors[task.priority ?? 3] || "gray";

	return (
		<div
			className={`p-4 rounded-lg border transition-all ${
				task.completed
					? "bg-gray-50 border-gray-200 opacity-75"
					: "bg-white border-gray-300 hover:shadow-md"
			}`}>
			<div className='flex items-start gap-3'>
				<input
					type='checkbox'
					title={`Toggle completion for "${task.title}"`}
					aria-label={`Toggle completion for "${task.title}"`}
					checked={task.completed}
					onChange={() => onToggle(task.id, task.completed)}
					className='mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
				/>

				<div className='flex-1'>
					<h3
						className={`font-semibold ${
							task.completed
								? "line-through text-gray-500"
								: "text-gray-800"
						}`}>
						{task.title}
					</h3>

					{task.description && (
						<p className='text-sm text-gray-600 mt-1'>
							{task.description}
						</p>
					)}

					<div className='flex items-center gap-2 mt-2'>
						<span
							className={`text-xs px-2 py-1 bg-${priorityColor}-100 text-${priorityColor}-700 rounded`}>
							{task.category}
						</span>
						<span className='text-xs text-gray-500'>
							Priority: {task.priority}
						</span>
						{task.dueDate && (
							<span className='text-xs text-gray-500'>
								Due:{" "}
								{new Date(task.dueDate).toLocaleDateString()}
							</span>
						)}
					</div>
				</div>

				<button
					onClick={() => onDelete(task.id)}
					className='text-red-600 hover:bg-red-50 p-2 rounded transition-colors'>
					🗑️
				</button>
			</div>
		</div>
	);
}
