import { isValidId, isValidFrameInterval } from "../../public/scripts/validators.js";
import saveAnimationGif from "../../src/save-animation-gif.js";
import { createAnimation, deleteAnimation, readAnimation } from "../../src/queries/animation.js";
import { Request } from "express";
import { readCollection } from "../../src/queries/collection.js";

export const handleCreateAnimation = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const { collectionId, frames, frameInterval } = req.body;
  if (!user || user.rank < 2) return false;
  if (!isValidId(collectionId) || !isValidFrameInterval(frameInterval) || !Array.isArray(frames)) return false;
  if (frames.some((frame) => typeof frame !== "number" || !isValidId(frame))) return false;
  const collection = await readCollection(collectionId);
  if (!collection || user.id !== collection.authorId) return false;
  const collectionMapsIds = collection.maps.map((map) => map.id);
  if (!frames.every((frame) => collectionMapsIds.includes(frame))) return false;
  const animationRecord = await createAnimation(collectionId);
  if (animationRecord === null) return false;
  await saveAnimationGif(animationRecord.id, frames, frameInterval);
  return true;
};

export const handleDeleteAnimation = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const animationId = parseInt(req.params.id);
  if (!user || user.rank < 1 || !isValidId(animationId)) return false;
  const animation = await readAnimation(animationId);
  if (!animation || animation.collection.authorId !== user.id) return false;
  const isDeleted = await deleteAnimation(animationId);
  return isDeleted;
};
