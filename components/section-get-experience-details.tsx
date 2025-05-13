export async function SectionGetExperienceDetails({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;

	// const experienceDetails = await whopApi.Experience();

	return (
		<div>
			Experience ID: <code>{experienceId}</code>
		</div>
	);
}
