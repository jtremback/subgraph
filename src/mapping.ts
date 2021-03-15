import { BigInt, Bytes } from "@graphprotocol/graph-ts";
// import { eventNames } from "node:process";
import {
  Contract,
  Activated,
  Approval,
  ApprovalForAll,
  Burned,
  Forged,
  Reforged,
  Transfer,
} from "../generated/Contract/Contract";
import { Gem } from "../generated/schema";

export function handleActivated(event: Activated): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = Gem.load(event.transaction.from.toHex());
  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (entity == null) {
  //   entity = new Gem(event.transaction.from.toHex());
  //   // Entity fields can be set using simple assignments
  //   // entity.count = BigInt.fromI32(0);
  // }
  // // BigInt and BigDecimal math are supported
  // // entity.count = entity.count + BigInt.fromI32(1);
  // // Entity fields can be set based on event parameters
  // entity.owner = event.params.owner;
  // entity.id = event.params.tokenId.toHex();
  // // Entities can be written to the store with `.save()`
  // entity.save();
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.
  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.baseURI(...)
  // - contract.getApproved(...)
  // - contract.getGemMetadata(...)
  // - contract.isApprovedForAll(...)
  // - contract.name(...)
  // - contract.ownerOf(...)
  // - contract.packLatent(...)
  // - contract.state_psiContract(...)
  // - contract.state_unactivatedGems(...)
  // - contract.supportsInterface(...)
  // - contract.symbol(...)
  // - contract.tokenByIndex(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenURI(...)
  // - contract.totalSupply(...)
  // - contract.uint128sToUint256(...)
  // - contract.uint256ToUint128s(...)
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleBurned(event: Burned): void {
  // This seems to be the best way to delete something?
  const oldGem = new Gem(event.params.tokenId.toHex());
  oldGem.burned = true;
  oldGem.save();
}

export function handleForged(event: Forged): void {
  let gem = new Gem(event.params.tokenId.toHex());

  gem.psi = event.params.psi;
  gem.owner = event.transaction.from;
  gem.burned = false;

  gem.save();
}

export function handleReforged(event: Reforged): void {
  // This seems to be the best way to delete something?
  const oldGem = new Gem(event.params.oldTokenId.toHex());
  oldGem.burned = true;
  oldGem.save();

  const newGem = new Gem(event.params.newTokenId.toHex());

  newGem.psi = oldGem.psi;
  newGem.owner = event.transaction.from;
  newGem.burned = false;

  newGem.save();
}

export function handleTransfer(event: Transfer): void {
  let gem = new Gem(event.params.tokenId.toHex());

  gem.owner = event.params.to;

  gem.save();
}
