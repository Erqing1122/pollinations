
import Debug from 'debug';
import { existsSync, mkdirSync } from 'fs';
import { AbortController } from "native-abort-controller";
import { writer } from "../../network/ipfsConnector.js";
import folderSync from "./folderSync.js";

const debug = Debug("ipfs/sender");


// Watch local path and and update IPFS incrementally.
// Optionally send updates via PubSub.
export const sender = ({ path, debounce, once, nodeid, publish }) => {

  const ipfsWriter = writer()


  // const { channel$: changedFiles$, close: closeFileWatcher, setPaused } = chunkedFilewatcher(watchPath, debounceTime)

  let abortController = null;
  // Close function closes both the writer and the publisher.
  // executeOnce makes sure it is called only once
  const close = async (error) => {
    debug("Closing sender", nodeid)
    if (abortController)
      abortController.abort()

    await ipfsWriter.close()
    debug("closed all")
  };

  async function startSending() {

    abortController = new AbortController()
    const cid$ = folderSync({ path, debounce, writer: ipfsWriter, once, signal: abortController.signal })

    debug("start consuming watched files")
    if (!existsSync(path)) {
      debug("Local: Root directory does not exist. Creating", path)
      mkdirSync(path, { recursive: true })
    }


    debug("getting cid stream")
    for await (const cid of cid$) {
      debug("publishing new cid", cid)
      await publish(cid)
      // yield cid
      if (once)
        await close()
    }

    debug("closed sender")
  }

  const stopSending = () => {
    abortController.abort()
  }

  return {
    startSending,
    close,
    stopSending
  }

};
