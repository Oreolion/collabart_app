"use node";
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api"; //
export const createBlockradarPaymentLinkAction = action({
  args: {
    projectId: v.id("projects"),
    buyerId: v.optional(v.string()), 
    amount: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    successMessage: v.optional(v.string()),
    inactiveMessage: v.optional(v.string()),
    paymentLimit: v.optional(v.number()),
    metadata: v.optional(
      v.union(
        v.string(),
        v.object({
          projectTitle: v.string(),
          projectId: v.string(),
          authorId: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
  
    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });

    if (!project) throw new ConvexError("Project not found");

    const amount: string | undefined =
      args.amount ?? (project.price ? String(project.price) : undefined);
    if (!amount)
      throw new ConvexError(
        "Project has no price set. Please specify an amount."
      );
    if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
      throw new ConvexError(
        "Invalid amount. Must be a number > 0 (as a string)."
      );
    }

    const safeSlug = (args.slug ?? `payment-${String(project._id)}`)
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .slice(0, 250);

    const apiKey = process.env.BLOCKRADAR_API_KEY;
    if (!apiKey) {
      throw new ConvexError(
        "BlockRadar API key not configured on server (set BLOCKRADAR_API_KEY in Convex)."
      );
    }

    const formData = new FormData();
    formData.append(
      "name",
      String(
        args.name ?? project.projectTitle ?? `Project ${project._id}`
      ).slice(0, 250)
    );
    formData.append("amount", String(amount));
    formData.append("slug", safeSlug);
    if (args.description)
      formData.append("description", String(args.description).slice(0, 250));
    if (args.redirectUrl)
      formData.append("redirectUrl", String(args.redirectUrl));
    if (args.successMessage)
      formData.append(
        "successMessage",
        String(args.successMessage).slice(0, 500)
      );
    if (args.inactiveMessage)
      formData.append(
        "inactiveMessage",
        String(args.inactiveMessage).slice(0, 500)
      );
    if (args.paymentLimit)
      formData.append("paymentLimit", String(args.paymentLimit));

    let metadataObj: any = {
      projectId: project._id,
      projectTitle: project.projectTitle,
      authorId: project.authorId,
      buyerId: args.buyerId, 
    };
    if (args.metadata) {
      if (typeof args.metadata === "string") {
        try {
          const parsed = JSON.parse(args.metadata);
          if (typeof parsed === "object" && parsed !== null)
            metadataObj = { ...metadataObj, ...parsed };
          else metadataObj.note = args.metadata;
        } catch {
          metadataObj.note = args.metadata;
        }
      } else {
        metadataObj = { ...metadataObj, ...args.metadata };
      }
    }
    formData.append("metadata", JSON.stringify(metadataObj));

    const res = await fetch("https://api.blockradar.co/v1/payment_links", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData as any,
    });

    const text = await res.text();
    let payload: any = text;
    try {
      payload = JSON.parse(text);
    } catch {
      // keep raw text
    }

    if (!res.ok) {
      throw new ConvexError(
        `BlockRadar API error (status=${res.status}): ${JSON.stringify(payload)}`
      );
    }

    return { status: res.status, payload };
  },
});
