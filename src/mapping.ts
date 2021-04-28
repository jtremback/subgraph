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

export function handleActivated(event: Activated): void {
  let gem = new Gem(event.params.tokenId.toString());
  gem.activated = true;
  gem.save();
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleBurned(event: Burned): void {
  // Do we want to actually delete it?
  // store.remove("Gem", event.params.tokenId.toString());
  const oldGem = new Gem(event.params.tokenId.toString());
  oldGem.burned = true;
  oldGem.save();
}

export function handleForged(event: Forged): void {
  const psi = Contract.bind(event.address)
    .getGemMetadata(event.params.tokenId)
    .toMap()
    .get("value4")
    .toBigInt();

  let gem = new Gem(event.params.tokenId.toString());

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
  gem.activated = false;
  gem.save();

  lastForgedNumber.number = currentNumber;
  lastForgedNumber.save();
}

export function handleReforged(event: Reforged): void {
  // Do we want to actually delete it?
  // store.remove("Gem", event.params.oldTokenId.toString());
  const oldGem = new Gem(event.params.oldTokenId.toString());
  oldGem.burned = true;
  oldGem.save();

  const psi: BigInt = Contract.bind(event.address)
    .getGemMetadata(event.params.newTokenId)
    .toMap()
    .get("value4")
    .toBigInt();

  const newGem = new Gem(event.params.newTokenId.toString());

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
  newGem.activated = false;

  newGem.save();

  lastForgedNumber.number = currentNumber;
  lastForgedNumber.save();
}

export function handleTransfer(event: Transfer): void {
  let gem = new Gem(event.params.tokenId.toString());

  gem.owner = event.params.to;

  gem.save();
}
