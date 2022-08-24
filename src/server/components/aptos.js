import fetch from "node-fetch";
import {alert} from "../helpers/logging.js";

export const getAptosState = async () => {
    const result = await fetch(globalThis.useNetwork === 'dev' ? config.aptos.devnet : config.aptos.ait)
    if (result.ok === false) {
        globalThis.aptosState = {
            chain_id: 0,
            epoch: 0,
            ledger_version: 0,
            ledger_timestamp: 0,
            network: config.aptos.network
        }
        alert(`Aptos Rest Node Error!`, await result.text())
    } else {
        const {
            chain_id,
            epoch,
            ledger_version,
            ledger_timestamp
        } = await result.json()

        globalThis.aptosState = {
            chain_id,
            epoch,
            ledger_version,
            ledger_timestamp,
            network: config.aptos.network
        }
    }

    setTimeout(getAptosState, 5000)
}