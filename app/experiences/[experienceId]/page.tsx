import { SectionVerifyUserToken } from "@/components/examples/section-01-verify-user-token";
import { SectionGetUserDetails } from "@/components/examples/section-02-get-user-details";
import { SectionGetExperienceDetails } from "@/components/examples/section-03-get-experience-details";
import { SectionSendANotification } from "@/components/examples/section-04-send-a-notification";
import { SectionSendAMessage } from "@/components/examples/section-05-send-a-message";
import { SectionMakeForumPost } from "@/components/examples/section-06-make-forum-post";
import { SectionRequestAPayment } from "@/components/examples/section-07-request-a-payment";
import { SectionWrapper } from "@/components/section-wrapper";
import Link from "next/link";

const sections = [
	{
		title: "Verify User Token",
		description: "Verify the user token using a header and JWT verification",
		Component: SectionVerifyUserToken,
	},
	{
		title: "Get User Details",
		description:
			"Get the details of the user by making an authenticated request",
		Component: SectionGetUserDetails,
	},
	{
		title: "Get Experience Details",
		description:
			"Get the details of the experience by using the path parameters",
		Component: SectionGetExperienceDetails,
	},
	{
		title: "Send a Notification",
		description: "Send a notification to the user",
		Component: SectionSendANotification,
	},
	{
		title: "Send a Message",
		description: "Send a message to the user",
		Component: SectionSendAMessage,
	},
	{
		title: "Make a Forum Post",
		description: "Make a forum post on the experience",
		Component: SectionMakeForumPost,
	},
	{
		title: "Request a Payment",
		description: "Request a payment from the user",
		Component: SectionRequestAPayment,
	},
];

export default function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	return (
		<div className="flex flex-col gap-4 p-4">
			<Link
				href="https://github.com/whopio/whop-nextjs-app-template"
				target="_blank"
				className="text-blue-500 hover:text-blue-600 underline"
			>
				View this repo on GitHub
			</Link>
			{sections.map((section, index) => (
				<SectionWrapper
					key={section.title}
					title={section.title}
					description={section.description}
					index={index}
				>
					<section.Component params={params} />
				</SectionWrapper>
			))}
		</div>
	);
}
