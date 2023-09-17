import { isValidId, isValidFrameDelay } from "../../public/scripts/validators.js";
import saveAnimationGif from "../../src/save-animation-gif.js";
import { createAnimation, deleteAnimation, readAnimation } from "../../src/queries/animation.js";
import { Request } from "express";
import { readCollection } from "../../src/queries/collection.js";

export const handleCreateAnimation = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 2) return false;
  const authorId = req.session.user.id;
  const collectionId = req.body.collectionId as number;
  const frames = req.body.frames as number[];
  const frameDelay = req.body.frameDelay as number;
  if (!isValidId(collectionId) || !isValidFrameDelay(frameDelay) || !Array.isArray(frames)) return false;
  const collection = await readCollection(collectionId);
  if (!collection || authorId !== collection.authorId) return false;
  const collectionMapsIds = collection.maps.map((map) => map.id);
  for (let frame of frames) {
    if (!isValidId(frame)) return false;
    if (!collectionMapsIds.includes(frame)) return false;
  }
  const animationRecord = await createAnimation(collectionId);
  if (animationRecord === null) return false;
  const isGifSaved = await saveAnimationGif(animationRecord.id, frames, frameDelay);
  return true;
};

export const handleDeleteAnimation = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 1) return false;
  const userId = req.session.user.id;
  const animationId = req.body.id;
  if (!isValidId(animationId)) return false;
  const animation = await readAnimation(animationId);
  if (!animation) return false;
  if (animation.collection.authorId !== userId) return false;
  const isDeleted = await deleteAnimation(animationId);
  return isDeleted;
};
