import { SetMetadata } from "@nestjs/common";
import { EntityTarget } from "typeorm";

export const OWNERSHIP_RULE_KEY = "ownership-rule";

export interface OwnershipRule {
  entity: EntityTarget<object>;
  resourceIdParam: string;
  ownerIdProperty: string;
}

export const CheckOwnership = (
  entity: EntityTarget<object>,
  resourceIdParam: string,
  ownerIdProperty: string,
) =>
  SetMetadata(OWNERSHIP_RULE_KEY, {
    entity,
    resourceIdParam,
    ownerIdProperty,
  } satisfies OwnershipRule);
