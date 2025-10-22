import { useEffect, useState } from "react";
import { productivityAPI } from "@/services/api";
import toast from "react-hot-toast";

interface Suggestion {
	title: string;
	category?: string;
}
interface Task {
	id: string;
	title: string;
	description?: string;
	category: string;
	priority: number;
	completed: boolean;
	dueDate?: string;
}

export default function Productivity() {
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(true);
	const [adding, setAdding] = useState(false);

	const load = async () => {
		try {
			setLoading(true);
			const [sugRes, taskRes] = await Promise.all([
				productivityAPI.suggestions(),
				productivityAPI.tasks.list(),
			]);
			setSuggestions(sugRes.data.suggestions || []);
			setTasks(taskRes.data.tasks || []);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load().catch(() => {});
	}, []);

	const add = async () => {
		if (!title.trim()) {
			toast.error("Please enter a task title");
			return;
		}
		try {
			setAdding(true);
			await productivityAPI.tasks.create({ title });
			toast.success("Task added! 📝");
			setTitle("");
			await load();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to add task");
		} finally {
			setAdding(false);
		}
	};

	const toggle = async (id: string, completed: boolean) => {
		try {
			await productivityAPI.tasks.update(id, { completed: !completed });
			toast.success(
				completed ? "Task marked as incomplete" : "Task completed! ✅"
			);
			await load();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to update task");
		}
	};

	const remove = async (id: string) => {
		try {
			await productivityAPI.tasks.remove(id);
			toast.success("Task removed! 🗑️");
			await load();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Failed to remove task");
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-violet-50 flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<svg
						className='animate-spin h-12 w-12 text-pink-600'
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
					<div className='text-lg font-medium text-gray-700'>
						Loading productivity...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-violet-50'>
			<div className='max-w-5xl mx-auto px-4 py-8'>
				<div className='mb-8 animate-in'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 flex items-center justify-center shadow-lg'>
							<span className='text-2xl'>🎯</span>
						</div>
						<div>
							<h1 className='text-3xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent'>
								Productivity
							</h1>
							<p className='text-gray-600'>
								Track tasks and get AI-powered suggestions 📈
							</p>
						</div>
					</div>
				</div>

				{suggestions.length > 0 && (
					<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
						<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
							<span>💡</span>
							AI Suggestions
						</h2>
						<ul className='space-y-3'>
							{suggestions.map((s, i) => (
								<li
									key={i}
									className='flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50 to-violet-50 rounded-xl border border-pink-200'>
									<span className='text-xl mt-0.5'>✨</span>
									<p className='text-gray-700 flex-1'>
										{s.title}
									</p>
								</li>
							))}
						</ul>
					</div>
				)}

				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>➕</span>
						Add Task
					</h2>
					<div className='flex gap-3'>
						<div className='relative flex-1'>
							<div className='absolute left-4 top-1/2 -translate-y-1/2 text-xl'>
								📝
							</div>
							<input
								className='w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 outline-none'
								placeholder='What needs to be done?'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && add()}
							/>
						</div>
						<button
							className='bg-gradient-to-r from-pink-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
							onClick={add}
							disabled={adding}>
							{adding ? "Adding..." : "Add"}
						</button>
					</div>
				</div>

				<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
						<span>📋</span>
						My Tasks
					</h2>
					{tasks.length === 0 ? (
						<div className='text-center py-12'>
							<div className='text-6xl mb-4'>✅</div>
							<p className='text-gray-500 text-lg'>
								No tasks yet. Add one above!
							</p>
						</div>
					) : (
						<ul className='space-y-3'>
							{tasks.map((t) => (
								<li
									key={t.id}
									className='flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-violet-50 rounded-xl border border-pink-200 hover:shadow-md transition-shadow duration-200'>
									<label className='flex items-center gap-3 cursor-pointer flex-1'>
										<input
											type='checkbox'
											className='w-5 h-5 rounded border-2 border-pink-400 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer'
											checked={t.completed}
											onChange={() =>
												toggle(t.id, t.completed)
											}
										/>
										<span
											className={`text-gray-800 ${
												t.completed
													? "line-through text-gray-400"
													: "font-medium"
											}`}>
											{t.title}
										</span>
									</label>
									<button
										className='ml-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium'
										onClick={() => remove(t.id)}>
										🗑️
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
