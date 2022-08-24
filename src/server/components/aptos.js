import fetch from "node-fetch";
import {alert} from "../helpers/logging.js";

export const getAptosState = async (network) => {
    const link = network === 'dev' ? config.aptos.devnet : config.aptos.ait
    const result = await fetch(link)
    if (result.ok === false) {
        alert(`Aptos Rest Node Error!`, await result.text())
        return {
            chain_id: 0,
            epoch: 0,
            ledger_version: 0,
            ledger_timestamp: 0,
            network: config.aptos.network
        }

    } else {
        const {
            chain_id,
            epoch,
            ledger_version,
            ledger_timestamp
        } = await result.json()

        return {
            chain_id,
            epoch,
            ledger_version,
            ledger_timestamp,
            network: config.aptos.network
        }
    }

    // setTimeout(getAptosState, 5000)
}