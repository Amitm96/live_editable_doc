import {  getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { redirect } from "next/navigation";

const liveblocks = new Liveblocks({
  secret: "sk_dev_Hbj9EVoLTbwuCV4qEs6W77SyN4-uqGAD14vClyWKO_9954MXVXXMLy0WBsYTkwPt",
});

export async function POST(request: Request) {
   const clerkUser = await currentUser();
   console.log(request);

   if(!clerkUser) redirect('sign-in');
   const {id, firstName, lastName, emailAddresses, imageUrl} = clerkUser;
  // Get the current user from your database
  const user = {
    id,
    info: {
        id,
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0].emailAddress,
        avatar: imageUrl,
        color: getUserColor(id)
    }
  };

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [], // Optional
    },
    { userInfo: user.info },
  );
  console.log(status, body);
  return new Response(body, { status });
}