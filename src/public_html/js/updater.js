const METRIC_DEFAULT = {
}

globalThis.updateLedgerData = (data) => {
    const ledger = data.ledger
    const target = data.target
    const error = typeof ledger.error !== "undefined"

    const apiStatus = $(".port-data-api")
    const chainStatus = $(".port-data-chain")
    const syncStatus = $(".port-data-sync")
    const healthyStatus = $(".port-data-healthy")
    const metricStatus = $(".port-data-metric")

    const in_chain = !error && +(data.ledger.chain_id) === +(data.ledger.aptos_chain_id)
    const synced = !error && Math.abs(+(data.ledger.ledger_version) - +(data.ledger.aptos_version)) <= (serverConfig.aptos.accuracy || 100)

    if (!error) {
        globalThis.ledgerVersion = ledger.ledger_version
        $("#chain_id").text(ledger.chain_id)
        $("#epoch").text(ledger.epoch)
        $("#ledger_version").text(n2f(ledger.ledger_version))
        $("#ledger_timestamp").text(datetime(ledger.ledger_timestamp / 1000).format(globalThis.dateFormat.full))
    } else {
        globalThis.ledgerVersion = -1
        chainStatus.addClass("bg-red fg-white")
        healthyStatus.addClass("bg-red fg-white")
        syncStatus.addClass("bg-red fg-white")
    }

    apiStatus
        .removeClassBy("bg-")
        .removeClassBy("fg-")
    if (!error && ledger && ledger.chain_id) {
        apiStatus.addClass("bg-green fg-white")
    } else {
        apiStatus.addClass("bg-red fg-white")
    }


    chainStatus
        .removeClassBy("bg-")
        .removeClassBy("fg-")

    if (!error) {
        if (in_chain) {
            chainStatus.addClass("bg-green fg-white")
        } else {
            chainStatus.addClass("bg-red fg-white")
        }
    } else {
        chainStatus.addClass("bg-red fg-white")
    }

    syncStatus
        .removeClassBy("bg-")
        .removeClassBy("fg-")

    if (!error) {
        if (synced) {
            syncStatus.addClass("bg-green fg-white")
        } else {
            syncStatus.addClass("bg-cyan fg-white")
        }
    } else {
        syncStatus.addClass("bg-red")
    }

    if (target && target.host) {
        $("#node_host").text(target.host)
    }
}

globalThis.updateHealthData = (data) => {
    if (!data.api) return
    console.log(data)
    const error = !data.ledger
    const {target, ledger, api} = data

    $(".info-data-host").html(`${target.host}`)
    $(".info-data-port").html(`${target.port}`)
    $(".info-data-prot").html(`${target.prot}`)
    $(".info-data-api").html(`${target.ver}`)

    $(".role-name").html(`${ledger.node_role}`)

    $(".info-data-chain").html(`${ledger.chain_id}`)
    $(".info-data-epoch").html(`${ledger.epoch}`)
    $(".info-data-version").html(`${n2f(ledger.ledger_version)}`)
    $(".info-data-block").html(`${n2f(ledger.block_height)}`)

    const n = $(".port-data-healthy")
        .removeClassBy("bg-")
        .removeClassBy("fg-")

    if (error) {
        n.addClass("bg-red fg-white")
    } else {
        const h = +data.ledger.ledger_version
        const c = h ? "bg-green" : "bg-red"

        n
            .removeClassBy("bg-")
            .removeClassBy("fg-")
            .addClass(c)
            .addClass("fg-white")
    }
}

globalThis.updateMetricData = (d) => {
    let metric
    const status = typeof d.storage_ledger_version !== "undefined"
    const errorLog = $("#error-log-metric").clear()

    if (!status) {
        if (typeof d === "string")
        errorLog.html(
            `<div class="remark alert">Metric: ${d.split(":error:")[1]}</div>`
        )
        metric = METRIC_DEFAULT
    } else {
        metric = (d)
    }

    if (status) {
        $(".port-data-metric").addClass("bg-green fg-white")
    } else {
        $(".port-data-metric").addClass("bg-red fg-white")
    }

    for (let o in metric) {
        if (["sync_timestamp_committed", "sync_timestamp_real", "sync_timestamp_synced"].includes(o)) {
            $(`#${o}`).text(datetime(+metric[o]).format(globalThis.dateFormat.full))
        } else {
            if (['system_total_memory'].includes(o)) {
                $(`#${o}`).text(n2f(metric[o]/1024**2))
            } else {
                $(`#${o}`).text(n2f(metric[o]))
            }
        }
    }

    const nodeType = $("#node-type")
    const nodeTypeIcon = $("#node-type-icon").removeClassBy("fg-")
    const networkIcon = $("#network-icon").removeClassBy("fg-")
    const versionIcon = $("#version-icon").removeClassBy("fg-")


    if (status) {
        nodeTypeIcon.addClass("fg-green")
        networkIcon.addClass("fg-green")
        versionIcon.addClass("fg-green")
    }

    if (metric.is_validator) {
        nodeType.text(`Validator`)
        nodeTypeIcon.html($("<span>").addClass("mif-user-secret"));
    } else {
        nodeType.text(`FullNode`)
        nodeTypeIcon.html($("<span>").addClass("mif-organization"));
    }

    const peerStatus = $(".port-data-peers")

    peerStatus
        .removeClassBy("bg-")
        .removeClassBy("fg-")
    if (metric.is_validator) {
        if (+metric.consensus_current_round > 0) {
            peerStatus.addClass("bg-green fg-white")
        } else {
            peerStatus.addClass("bg-red fg-white")
        }
    } else {
        if (+metric.connections_outbound > 0 ) {
            peerStatus.addClass("bg-green fg-white")
        } else {
            peerStatus.addClass("bg-red fg-white")
        }
    }

    const metricStatus = $("#port-data-metric")
    metricStatus
        .removeClassBy("bg-")
        .removeClassBy("fg-")
    if (status) {
        metricStatus.addClass("bg-green fg-white")
    } else {
        metricStatus.addClass("bg-red fg-white")
    }
}


globalThis.updateApiData = (data) => {
    updateLedgerData(data)
    updateHealthData(data)
}


globalThis.updatePortTest = data => {
    const ports = data.test
    const targets = data.target.ports

    if (!ports) return
    for(let port in targets){
        const el = $("#port-"+port)
        const pr = el
        const portNum = targets[port]
        pr.removeClassBy("bg-").addClass(!portNum ? 'bg-violet' : ports[port] ? "bg-green" : "bg-red").addClass("fg-white")
        el.html(`${!portNum ? 'NOT DEF' : portNum}`)
    }
}

globalThis.updateAptosState = data => {
    if (!data) return

    globalThis.aptosState = data

    const {chain_id, ledger_version, ledger_timestamp, epoch, network} = data
    const aptosVersion = $("#aptos-version")
    const aptosChain = $("#aptos-chain-id")

    aptosChain.text(n2f(chain_id))
    aptosVersion.text(n2f(ledger_version))
}