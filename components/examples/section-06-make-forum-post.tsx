import { whopApi } from "@/lib/whop-api";

export async function SectionMakeForumPost({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const experience = await whopApi.GetExperience({ experienceId });
  const companyId = experience.experience.company.id;
  // user user_v9KUoZvTGp6ID is an admin of the current company.
  const forumExperiences = await whopApi
    .withUser("user_v9KUoZvTGp6ID")
    .GetExperiencesForCompanyOrWhop({
      companyId,
      appId: "app_dYfm2IdXhDMquv",
      onAccessPass: true,
      first: 20,
    });

  async function makeForumPost(formData: FormData) {
    "use server";
    const experienceId = formData.get("experienceId");
    const content = formData.get("content");

    if (
      !experienceId ||
      !content ||
      typeof experienceId !== "string" ||
      typeof content !== "string"
    ) {
      throw new Error("Experience ID and content are required");
    }

    console.log(experienceId, content);

    await whopApi
      .withUser("user_v9KUoZvTGp6ID")
      .withCompany(companyId)
      .CreateForumPost({
        input: { content, experienceId, title: "Created by the SDK" },
      });
  }

  return (
    <div>
      <form action={makeForumPost} className="flex gap-2 items-center">
        <select name="experienceId">
          {forumExperiences.company?.experiencesV2.nodes
            ?.filter(notEmpty)
            .map((experience) => (
              <option key={experience.id} value={experience.id}>
                {experience.name} - {experience.id}
              </option>
            ))}
        </select>
        <input
          className="w-full"
          type="text"
          name="content"
          placeholder="Content"
        />
        <button className="shrink-0" type="submit">
          Make Forum Post
        </button>
      </form>
    </div>
  );
}

function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
