import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUsersStore, type User } from "@/store/usersStore";
import toast from "react-hot-toast";
import { Page } from "@/components/ui/Page";
import { Card, CardBody } from "@/components/ui/Card";

export default function Profile() {
	const user = useAuthStore((s) => s.user);
	const setUser = useAuthStore((s) => s.setUser);
	const { getProfile, updateProfile, loading } = useUsersStore();
	const [profile, setProfile] = useState<User | null>(null);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		year: 1,
		branch: "",
		interests: "",
		goals: "",
	});

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		await getProfile();
		const response = useUsersStore.getState().profile;

		if (response) {
			setProfile(response);
			setFormData({
				name: response.name || "",
				year: response.year || 1,
				branch: response.branch || "",
				interests: response.interests?.join(", ") || "",
				goals: response.goals?.join(", ") || "",
			});
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload: any = {
			name: formData.name,
		};

		if (user?.role === "STUDENT") {
			payload.year = formData.year;
			payload.branch = formData.branch;
			payload.interests = formData.interests
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			payload.goals = formData.goals
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
		}

		await updateProfile(payload);

		if (!useUsersStore.getState().error) {
			const updatedProfile = useUsersStore.getState().profile;
			if (updatedProfile) {
				setProfile(updatedProfile);
				setUser({ ...user!, name: updatedProfile.name });
			}
			toast.success("Profile updated successfully!");
			setEditing(false);
		} else {
			toast.error(
				useUsersStore.getState().error || "Failed to update profile"
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

	if (!profile) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-600'>Profile not found</p>
			</div>
		);
	}

	return (
		<Page className='max-w-4xl mx-auto space-y-8'>
			{/* Header */}
			<div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg'>
				<div className='flex items-center gap-6'>
					<div className='w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold'>
						{profile.name.charAt(0).toUpperCase()}
					</div>
					<div>
						<h1 className='text-3xl font-bold'>{profile.name}</h1>
						<p className='text-blue-100 mt-1'>{profile.email}</p>
						<p className='text-blue-100'>
							<span className='px-3 py-1 bg-white/20 rounded-full text-sm mt-2 inline-block'>
								{profile.role}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* Profile Information */}
			<Card>
				<CardBody className='p-8'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-2xl font-bold text-gray-800'>
							Profile Information
						</h2>

						{!editing && (
							<button
								onClick={() => setEditing(true)}
								className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
								✏️ Edit Profile
							</button>
						)}
					</div>

					{editing ? (
						<form
							onSubmit={handleUpdateProfile}
							className='space-y-6'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Full Name
								</label>
								<input
									type='text'
									required
									title='Full Name'
									placeholder='Full Name'
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
							</div>

							{user?.role === "STUDENT" && (
								<>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label
												htmlFor='year'
												className='block text-sm font-medium text-gray-700 mb-2'>
												Year
											</label>
											<input
												id='year'
												type='number'
												min='1'
												max='4'
												value={formData.year}
												onChange={(e) =>
													setFormData({
														...formData,
														year: parseInt(
															e.target.value
														),
													})
												}
												title='Year'
												placeholder='Year (1-4)'
												className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>
												Branch
											</label>
											<input
												type='text'
												value={formData.branch}
												onChange={(e) =>
													setFormData({
														...formData,
														branch: e.target.value,
													})
												}
												className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
												placeholder='Computer Science'
											/>
										</div>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Interests (comma-separated)
										</label>
										<textarea
											value={formData.interests}
											onChange={(e) =>
												setFormData({
													...formData,
													interests: e.target.value,
												})
											}
											rows={3}
											className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Web Development, Machine Learning, etc.'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Goals (comma-separated)
										</label>
										<textarea
											value={formData.goals}
											onChange={(e) =>
												setFormData({
													...formData,
													goals: e.target.value,
												})
											}
											rows={3}
											className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Get internship, Learn React, etc.'
										/>
									</div>
								</>
							)}

							<div className='flex gap-3'>
								<button
									type='button'
									onClick={() => {
										setEditing(false);
										loadProfile();
									}}
									className='flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
									Cancel
								</button>
								<button
									type='submit'
									className='flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
									Save Changes
								</button>
							</div>
						</form>
					) : (
						<div className='space-y-6'>
							<InfoRow label='Email' value={profile.email} />
							<InfoRow label='Role' value={profile.role} />

							{profile.enrollmentNo && (
								<InfoRow
									label='Enrollment Number'
									value={profile.enrollmentNo}
								/>
							)}

							{user?.role === "STUDENT" && (
								<>
									{profile.year && (
										<InfoRow
											label='Year'
											value={`Year ${profile.year}`}
										/>
									)}
									{profile.branch && (
										<InfoRow
											label='Branch'
											value={profile.branch}
										/>
									)}

									{profile.interests &&
										profile.interests.length > 0 && (
											<div>
												<h3 className='text-sm font-medium text-gray-700 mb-2'>
													Interests
												</h3>
												<div className='flex flex-wrap gap-2'>
													{profile.interests.map(
														(interest, index) => (
															<span
																key={index}
																className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm'>
																{interest}
															</span>
														)
													)}
												</div>
											</div>
										)}

									{profile.goals &&
										profile.goals.length > 0 && (
											<div>
												<h3 className='text-sm font-medium text-gray-700 mb-2'>
													Goals
												</h3>
												<div className='flex flex-wrap gap-2'>
													{profile.goals.map(
														(goal, index) => (
															<span
																key={index}
																className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm'>
																{goal}
															</span>
														)
													)}
												</div>
											</div>
										)}
								</>
							)}
						</div>
					)}
				</CardBody>
			</Card>
		</Page>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className='border-b border-gray-200 pb-4'>
			<p className='text-sm text-gray-600 mb-1'>{label}</p>
			<p className='text-lg font-medium text-gray-800'>{value}</p>
		</div>
	);
}
