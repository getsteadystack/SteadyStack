import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@steadystack/auth";

const f = createUploadthing();

const getSession = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return session?.user;
};

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For connected requests, only 1 image of 4MB max is allowed
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await getSession(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
