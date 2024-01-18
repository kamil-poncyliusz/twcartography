import { Request } from "express";
import { isValidReadCollectionsRequestFilters } from "../../public/scripts/requests-validators.js";
import { deleteCollection, readCollection, readCollections, updateCollection } from "../../src/queries/collection.js";
import { isValidCollectionDescription, isValidId, isValidTitle } from "../../public/scripts/validators.js";
import { CollectionWithRelations, ReadCollectionsRequestFilters } from "../../src/types";

export const handleReadCollections = async function (req: Request): Promise<CollectionWithRelations[]> {
  const worldId = parseInt(req.params.world);
  const authorId = parseInt(req.params.author);
  const page = parseInt(req.params.page);
  const payload: ReadCollectionsRequestFilters = {
    worldId: worldId,
    authorId: authorId,
    page: page,
  };
  if (!isValidReadCollectionsRequestFilters(payload)) return [];
  const collections = await readCollections(payload.page, { worldId: payload.worldId, authorId: payload.authorId });
  return collections;
};

export const handleUpdateCollection = async function (req: Request): Promise<boolean> {
  const id = parseInt(req.params.id);
  if (!req.session.user || !isValidId(id)) return false;
  const collection = await readCollection(id);
  if (!collection || collection.author.id !== req.session.user.id) return false;
  const title = req.body.title;
  const description = req.body.description;
  if (isValidTitle(title)) {
    const isUpdated = await updateCollection(id, { title: title });
    return isUpdated;
  } else if (isValidCollectionDescription(description)) {
    const isUpdated = await updateCollection(id, { description: description });
    return isUpdated;
  }
  return false;
};

export const handleDeleteCollection = async function (req: Request): Promise<boolean> {
  if (!req.session.user || req.session.user.rank < 1) return false;
  const userId = req.session.user.id;
  const collectionId = parseInt(req.params.id);
  if (!isValidId(collectionId)) return false;
  const collection = await readCollection(collectionId);
  if (!collection || collection.authorId !== userId) return false;
  const isDeleted = await deleteCollection(collectionId);
  return isDeleted;
};
