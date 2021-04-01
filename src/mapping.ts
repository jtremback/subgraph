import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
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
import { Gem, LastForgedNumber } from "../generated/schema";

function parseGemMetadata(tokenId: string): BigInt[] {
  // Remove 0x
  tokenId = tokenId.slice(2);

  // Get latents
  const latent1 = BigInt.fromString("0x" + tokenId.slice(0, 8));
  const latent2 = BigInt.fromString("0x" + tokenId.slice(8, 16));
  const latent3 = BigInt.fromString("0x" + tokenId.slice(16, 24));
  const latent4 = BigInt.fromString("0x" + tokenId.slice(24, 32));

  // Get PSI
  const psi = BigInt.fromString("0x" + tokenId.slice(32, 64)).div(
    BigInt.fromString("1000000000000000000")
  );

  return [latent1, latent2, latent3, latent4, psi];
}

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
  // Do we want to actually delete it?
  // store.remove("Gem", event.params.tokenId.toHex());
  const oldGem = new Gem(event.params.tokenId.toHex());
  oldGem.burned = true;
  oldGem.save();
}

export function handleForged(event: Forged): void {
  const psi = parseGemMetadata(event.params.tokenId.toHex())[4];

  let gem = new Gem(event.params.tokenId.toHex());

  let lastForgedNumber = LastForgedNumber.load("");
  if (lastForgedNumber == null) {
    lastForgedNumber = new LastForgedNumber("");
    lastForgedNumber.number = BigInt.fromString("0");
  }
  let currentNumber = lastForgedNumber.number.plus(BigInt.fromString("1"));

  gem.number = currentNumber;
  gem.psi = psi;
  gem.owner = event.transaction.from;
  gem.burned = false;
  gem.forgeTime = event.block.timestamp;
  gem.forgeBlock = event.block.number;
  gem.save();

  lastForgedNumber.number = currentNumber;
  lastForgedNumber.save();
}

export function handleReforged(event: Reforged): void {
  // Do we want to actually delete it?
  // store.remove("Gem", event.params.oldTokenId.toHex());
  const oldGem = new Gem(event.params.oldTokenId.toHex());
  oldGem.burned = true;
  oldGem.save();

  const psi = parseGemMetadata(event.params.newTokenId.toHex())[4];

  const newGem = new Gem(event.params.newTokenId.toHex());

  let lastForgedNumber = LastForgedNumber.load("");
  if (lastForgedNumber == null) {
    lastForgedNumber = new LastForgedNumber("");
    lastForgedNumber.number = BigInt.fromString("0");
  }
  let currentNumber = lastForgedNumber.number.plus(BigInt.fromString("1"));

  newGem.number = currentNumber;
  newGem.psi = psi;
  newGem.owner = event.transaction.from;
  newGem.burned = false;
  newGem.forgeTime = event.block.timestamp;
  newGem.forgeBlock = event.block.number;

  newGem.save();

  lastForgedNumber.number = currentNumber;
  lastForgedNumber.save();
}

export function handleTransfer(event: Transfer): void {
  let gem = new Gem(event.params.tokenId.toHex());

  gem.owner = event.params.to;

  gem.save();
}
