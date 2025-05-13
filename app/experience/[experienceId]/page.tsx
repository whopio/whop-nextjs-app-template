import { SectionGetExperienceDetails } from "@/components/section-get-experience-details";
import { SectionGetUserDetails } from "@/components/section-get-user-details";
import { SectionRequestAPayment } from "@/components/section-request-a-payment";
import { SectionSendAMessage } from "@/components/section-send-a-message";
import { SectionSendANotification } from "@/components/section-send-a-notification";
import { SectionVerifyUserToken } from "@/components/section-verify-user-token";
import { SectionWrapper } from "@/components/section-wrapper";
import { Suspense } from "react";

export default async function ExperiencePage({
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
				<Suspense fallback={<LoadingFallback />}>
					<SectionVerifyUserToken />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper
				title="Get User Details"
				description="Get the details of the user by making an authenticated request"
				index={2}
			>
				<Suspense fallback={<LoadingFallback />}>
					<SectionGetUserDetails />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper
				title="Get Experience Details"
				description="Get the details of the experience by using the path parameters"
				index={3}
			>
				<Suspense fallback={<LoadingFallback />}>
					<SectionGetExperienceDetails params={params} />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper
				title="Send a Notification"
				description="Send a notification to the user"
				index={4}
			>
				<Suspense fallback={<LoadingFallback />}>
					<SectionSendANotification />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper
				title="Send a Message"
				description="Send a message to the user"
				index={5}
			>
				<Suspense fallback={<LoadingFallback />}>
					<SectionSendAMessage />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper
				title="Request a Payment"
				description="Request a payment from the user"
				index={6}
			>
				<Suspense fallback={<LoadingFallback />}>
					<SectionRequestAPayment />
				</Suspense>
			</SectionWrapper>
		</div>
	);
}

function LoadingFallback() {
	return <div>Loading...</div>;
}
