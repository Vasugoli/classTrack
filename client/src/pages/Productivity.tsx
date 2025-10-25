import { useState } from "react";
import {
	useTasks,
	useSuggestions,
	useCreateTask,
	useUpdateTask,
	useDeleteTask,
} from "@/hooks/useTasks";

export default function Productivity() {
	const [title, setTitle] = useState("");

	const { data: suggestionsData } = useSuggestions();
	const { data: tasksData } = useTasks();
	const createMutation = useCreateTask();
	const updateMutation = useUpdateTask();
	const deleteMutation = useDeleteTask();

	const suggestions = suggestionsData?.suggestions || [];
	const tasks = tasksData?.tasks || [];

	const add = async () => {
		if (!title.trim()) {
			return;
		}
		createMutation.mutate(
			{ title },
			{
				onSuccess: () => setTitle(""),
			}
		);
	};

	const toggle = async (id: string, completed: boolean) => {
		updateMutation.mutate({ id, data: { completed: !completed } });
	};

	const remove = async (id: string) => {
		deleteMutation.mutate(id);
	};

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
							disabled={createMutation.isPending}>
							{createMutation.isPending ? "Adding..." : "Add"}
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
