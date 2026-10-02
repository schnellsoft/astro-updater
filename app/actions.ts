"use server";

import { revalidatePath } from "next/cache";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { addDogToDirectory, removeDogFromDirectory } from "@/lib/dogs";
import { createR2Client } from "@/lib/r2";

export type DogFormState = {
  error: string | null;
  success: string | null;
  resetKey: number;
};

export type SaveToCloudState = {
  error: string | null;
  success: string | null;
};

export async function addDog(
  previousState: DogFormState,
  formData: FormData,
): Promise<DogFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const ageValue = String(formData.get("age") ?? "").trim();
  const race = String(formData.get("race") ?? "").trim();
  const health = String(formData.get("health") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const age = Number(ageValue);

  if (!name || !ageValue || !race || !health || !details) {
    return {
      error: "Please complete every field.",
      success: null,
      resetKey: previousState.resetKey,
    };
  }
  if (!Number.isInteger(age) || age < 0 || age > 40) {
    return {
      error: "Enter an age from 0 to 40 years.",
      success: null,
      resetKey: previousState.resetKey,
    };
  }
  if (
    name.length > 80 ||
    race.length > 100 ||
    health.length > 300 ||
    details.length > 2000
  ) {
    return {
      error: "One or more fields are longer than allowed.",
      success: null,
      resetKey: previousState.resetKey,
    };
  }

  try {
    const inserted = addDogToDirectory({ name, age, race, health, details });
    if (!inserted) {
      return {
        error: "A dog with that name is already listed.",
        success: null,
        resetKey: previousState.resetKey,
      };
    }
  } catch {
    return {
      error: "The dog could not be saved. Please try again.",
      success: null,
      resetKey: previousState.resetKey,
    };
  }

  revalidatePath("/");
  return {
    error: null,
    success: `${name} was added to the directory.`,
    resetKey: previousState.resetKey + 1,
  };
}

export async function removeDog(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) return;

  removeDogFromDirectory(id);
  revalidatePath("/");
}

export async function saveToCloud(
  _previousState: SaveToCloudState,
): Promise<SaveToCloudState> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    return { error: "R2_BUCKET_NAME is not configured.", success: null };
  }

  try {
    const jsonPath = join(process.cwd(), "dogs.json");
    const body = readFileSync(jsonPath, "utf8");
    const key = process.env.R2_OBJECT_KEY || "dogs.json";

    const client = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "application/json",
      }),
    );

    const deployHookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;
    if (deployHookUrl) {
      // Fire-and-forget: a failed rebuild trigger shouldn't fail the upload.
      try {
        await fetch(deployHookUrl, { method: "POST" });
      } catch {
        return {
          error: null,
          success:
            "dogs.json was uploaded, but triggering the Cloudflare rebuild failed.",
        };
      }
    }

    return { error: null, success: "dogs.json was uploaded to Cloudflare R2." };
  } catch {
    return { error: "Upload to R2 failed. Please try again.", success: null };
  }
}
