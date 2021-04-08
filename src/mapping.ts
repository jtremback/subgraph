import { BigInt, Bytes, store, log } from "@graphprotocol/graph-ts";
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
  Contract__getGemMetadataResult,
} from "../generated/Contract/Contract";
import { Gem, LastForgedNumber } from "../generated/schema";

// function parseGemMetadata(tokenId: string): BigInt[] {
//   // Remove 0x
//   tokenId = tokenId.slice(2);

//   // Get latents
//   const latent1 = BigInt.fromUnsignedBytes(
//     Bytes.fromHexString("0x" + tokenId.slice(0, 8))
//   );
//   const latent2 = BigInt.fromUnsignedBytes(
//     Bytes.fromHexString("0x" + tokenId.slice(8, 16))
//   );
//   const latent3 = BigInt.fromUnsignedBytes(
//     Bytes.fromHexString("0x" + tokenId.slice(16, 24))
//   );
//   const latent4 = BigInt.fromUnsignedBytes(
//     Bytes.fromHexString("0x" + tokenId.slice(24, 32))
//   );

//   // Get PSI
//   const psi = BigInt.fromUnsignedBytes(
//     Bytes.fromHexString("0x" + tokenId.slice(32, 64))
//   ).div(BigInt.fromString("1000000000000000000"));

//   return [latent1, latent2, latent3, latent4, psi];
// }

export function handleActivated(event: Activated): void {
  // let gem = new Gem(event.params.tokenId.toHex());
  // gem.activated = true;
  // gem.save();
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
  const psi = Contract.bind(event.address)
    .getGemMetadata(event.params.tokenId)
    .toMap()
    .get("value4")
    .toBigInt();

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
  // gem.activated = false;
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

  const psi: BigInt = Contract.bind(event.address)
    .getGemMetadata(event.params.newTokenId)
    .toMap()
    .get("value4")
    .toBigInt();

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
  // newGem.activated = false;

  newGem.save();

  lastForgedNumber.number = currentNumber;
  lastForgedNumber.save();
}

export function handleTransfer(event: Transfer): void {
  let gem = new Gem(event.params.tokenId.toHex());

  gem.owner = event.params.to;

  gem.save();
}
