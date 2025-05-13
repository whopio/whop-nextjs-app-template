import { SectionGetExperienceDetails } from "@/components/examples/section-get-experience-details";
import { SectionGetUserDetails } from "@/components/examples/section-get-user-details";
import { SectionRequestAPayment } from "@/components/examples/section-request-a-payment";
import { SectionSendAMessage } from "@/components/examples/section-send-a-message";
import { SectionSendANotification } from "@/components/examples/section-send-a-notification";
import { SectionVerifyUserToken } from "@/components/examples/section-verify-user-token";
import { SectionWrapper } from "@/components/section-wrapper";

export default function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	return (
		<div className="flex flex-col gap-4 p-4">
			<SectionWrapper
				title="Verify User Token"
				description="Verify the user token using a header and JWT verification"
				index={1}
			>
				<SectionVerifyUserToken />
			</SectionWrapper>

			<SectionWrapper
				title="Get User Details"
				description="Get the details of the user by making an authenticated request"
				index={2}
			>
				<SectionGetUserDetails />
			</SectionWrapper>

			<SectionWrapper
				title="Get Experience Details"
				description="Get the details of the experience by using the path parameters"
				index={3}
			>
				<SectionGetExperienceDetails params={params} />
			</SectionWrapper>

			<SectionWrapper
				title="Send a Notification"
				description="Send a notification to the user"
				index={4}
			>
				<SectionSendANotification />
			</SectionWrapper>

			<SectionWrapper
				title="Send a Message"
				description="Send a message to the user"
				index={5}
			>
				<SectionSendAMessage />
			</SectionWrapper>

			<SectionWrapper
				title="Request a Payment"
				description="Request a payment from the user"
				index={6}
			>
				<SectionRequestAPayment />
			</SectionWrapper>
		</div>
	);
}
