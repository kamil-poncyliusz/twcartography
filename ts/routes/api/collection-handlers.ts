import { Request } from "express";
import { isValidReadCollectionsRequestFilters } from "../../public/scripts/requests-validators.js";
import { deleteCollection, readCollection, readCollections, updateCollection } from "../../src/queries/collection.js";
import { isValidCollectionDescription, isValidId, isValidTitle } from "../../public/scripts/validators.js";
import { CollectionWithRelations, ReadCollectionsRequestFilters } from "../../src/types";

export const handleReadCollections = async function (req: Request): Promise<CollectionWithRelations[]> {
  const payload: ReadCollectionsRequestFilters = {
    worldId: parseInt(req.params.world),
    authorId: parseInt(req.params.author),
    page: parseInt(req.params.page),
  };
  if (!isValidReadCollectionsRequestFilters(payload)) return [];
  const collections = await readCollections(payload.page, { worldId: payload.worldId, authorId: payload.authorId });
  return collections;
};

export const handleUpdateCollection = async function (req: Request): Promise<boolean> {
  const collectionId = parseInt(req.params.id);
  if (!req.session.user || !isValidId(collectionId)) return false;
  const collection = await readCollection(collectionId);
  if (!collection || collection.author.id !== req.session.user.id) return false;
  const { title, description } = req.body;
  if (isValidTitle(title)) {
    const isUpdated = await updateCollection(collectionId, { title: title });
    return isUpdated;
  }
  if (isValidCollectionDescription(description)) {
    const isUpdated = await updateCollection(collectionId, { description: description });
    return isUpdated;
  }
  return false;
};

export const handleDeleteCollection = async function (req: Request): Promise<boolean> {
  const user = req.session.user;
  const collectionId = parseInt(req.params.id);
  if (!user || user.rank < 1 || !isValidId(collectionId)) return false;
  const collection = await readCollection(collectionId);
  if (!collection) return false;
  const hasRightsToDelete = collection.authorId === user.id || user.rank >= 10;
  if (!hasRightsToDelete) return false;
  const isDeleted = await deleteCollection(collectionId);
  return isDeleted;
};
