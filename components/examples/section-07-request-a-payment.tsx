import { verifyUserToken, whopApi } from "@/lib/whop-api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function SectionRequestAPayment({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const experience = await whopApi.GetExperience({ experienceId });
  const companyId = experience.experience.company.id;

  async function requestPayment(formData: FormData) {
    "use server";
    const requestHeaders = await headers();
    const userTokenData = await verifyUserToken(requestHeaders);
    const amount = formData.get("amount");
    const description = formData.get("description");

    if (
      !userTokenData?.userId ||
      !amount ||
      !description ||
      typeof userTokenData?.userId !== "string" ||
      typeof amount !== "string" ||
      typeof description !== "string"
    ) {
      throw new Error("User ID, amount, and description are required");
    }

    console.log({
      userId: userTokenData.userId,
      amount: parseInt(amount),
      description,
      currency: "usd",
      metadata: {
        creditsPurchased: "100",
        tier: "bronze",
      },
    });

    const response = await whopApi.withCompany(companyId).ChargeUser({
      input: {
        userId: userTokenData.userId,
        amount: parseInt(amount),
        description,
        currency: "usd",
        metadata: {
          creditsPurchased: "100",
          tier: "bronze",
        },
      },
    });

    // Open the payment response URL in a new tab
    if (response.chargeUser?.checkoutSession?.purchaseUrl) {
      redirect(response.chargeUser.checkoutSession.purchaseUrl);
    }
  }

  return (
    <div>
      <form action={requestPayment} className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <input
            className="w-full border border-gray-300 rounded-md p-2"
            type="number"
            required
            name="amount"
            placeholder="Amount (in cents) to charge"
          />
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="w-full border border-gray-300 rounded-md p-2"
            type="text"
            required
            name="description"
            placeholder="Payment Description"
          />
        </div>
        <button
          className="shrink-0 bg-blue-500 text-white rounded-md p-2"
          type="submit"
        >
          Request Payment
        </button>
      </form>
    </div>
  );
}
