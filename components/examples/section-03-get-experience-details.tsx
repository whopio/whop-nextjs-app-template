import { whopApi } from "@/lib/whop-api";

export async function SectionGetExperienceDetails({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;

	const thisExperience = await whopApi.GetExperience({
		experienceId: experienceId,
	});

	return (
		<div>
			Experience ID: <code>{experienceId}</code>
			<pre>{JSON.stringify(thisExperience, null, 2)}</pre>
		</div>
	);
}
