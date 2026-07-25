const { PrismaClient } = require("@prisma/client");
const { PrismaClient: AttachmentsPrismaClient } = require("../src/lib/generated/attachmentsClient");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_3GpkheLncSq4@ep-long-heart-adke13mm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

const prismaAttachments = new AttachmentsPrismaClient({
  datasources: {
    db: {
      url: process.env.ATTACH_DATABASE_URL || "postgresql://neondb_owner:npg_lkzg6Ys0GMVr@ep-plain-block-am9945wh.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function wipePosts() {
  console.log("Starting post & post attachment cleanup...");
  
  try {
    const viewsDeleted = await prisma.view.deleteMany({});
    console.log(`Deleted ${viewsDeleted.count} post views.`);

    const reactionsDeleted = await prisma.reaction.deleteMany({});
    console.log(`Deleted ${reactionsDeleted.count} post reactions.`);

    const commentsDeleted = await prisma.comment.deleteMany({});
    console.log(`Deleted ${commentsDeleted.count} post comments.`);

    const postsDeleted = await prisma.post.deleteMany({});
    console.log(`Deleted ${postsDeleted.count} global feed posts.`);

    const postAttachmentsDeleted = await prismaAttachments.attachment.deleteMany({
      where: { messageId: null }
    });
    console.log(`Deleted ${postAttachmentsDeleted.count} post attachment metadata records.`);

    console.log("SUCCESS: Global feed posts, reactions, comments, views, and post media records successfully wiped!");
  } catch (err) {
    console.error("ERROR during post wipe:", err);
  } finally {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  }
}

wipePosts();
