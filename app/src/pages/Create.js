import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Link, Paper, Typography } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import Markdown from 'markdown-to-jsx';

import readMetadata from "../utils/notebookMetadata";
import Debug from "debug";


// Components
import FormView from '../components/Form'
import ImageViewer, { getCoverImage } from '../components/MediaViewer'
import { SEO } from "../components/Helmet";
import { SocialPostStatus } from "../components/Social";
import useIPFS from "../hooks/useIPFS";
import Acordion from "../components/Acordion";
import useIPFSWrite from "../hooks/useIPFSWrite";
import NotebookTitle from "../components/NotebookTitle";
import { useNavigate } from "react-router";

const debug = Debug("Model");


export default React.memo(function Model({ contentID, node}) {

  const { connected, publish } = node;

  const ipfs = useIPFS(contentID);
  const navigate = useNavigate();
  //let { ipfs, nodeID, status, contentID, dispatchInput } = state;
  const dispatchInput = useIPFSWrite(ipfs, publish);

  const metadata = useMemo(() => getNotebookMetadata(ipfs), [ipfs?.input]);


  const dispatchForm = useCallback(async inputs => {
    debug("dispatchForm", inputs);
    await dispatchInput({
      ...inputs,
      ["notebook.ipynb"]: ipfs?.input["notebook.ipynb"],
      formAction: "submit"
    });
  debug("dispatched Form");
  navigate("/n")
}, [ipfs?.input]);

  const cancelForm = useCallback(() => dispatchInput({ ...ipfs.input, formAction: "cancel" }), [ipfs?.input]);

  debug("ipfs state before rendering model", ipfs)


  return <>
      <Box my={2}>

        <SEO metadata={metadata} ipfs={ipfs} cid={contentID}/>
        {/* control panel */}
        <NotebookTitle metadata={metadata} />
        {/* just in case */}
        <NotebookDescription metadata={metadata}/>
        

        {/* inputs */}
        <div style={{ width: '100%' }}>
          {
             !connected && <Alert severity="info">The inputs are <b>disabled</b> because <b>no Colab node is running</b>! Click on <b>LAUNCH</b> (top right) or refer to INSTRUCTIONS for further instructions.</Alert>
          }
          <FormView
            input={ipfs?.input}
            connected={connected}
            //colabState={ipfs?.output?.status}
            metadata={metadata}
            onSubmit={dispatchForm}
            onCancel={cancelForm}
          />
        </div>
        {
          ipfs?.output?.social &&
          (<div style={{ width: '100%' }}>
            <h3>Social</h3>
            <br />
            <SocialPostStatus results={ipfs?.output?.social} />
          </div>)
        }

        {/* previews */}
        {ipfs.output && <div >
          <ImageViewer output={ipfs.output} contentID={contentID} />
        </div>
        }

      </Box>
  </>
});


// for backward compatibility we check if the notebook.ipynb is at / or at /input
// the new "correct" way is to save the notebook.ipynb to /input

const getNotebookMetadata = ipfs => readMetadata((ipfs?.input && ipfs.input["notebook.ipynb"]) || ipfs && ipfs["notebook.ipynb"]);


// Stepper

const steps = [
  {
    title: '1. Connect to Google Colab',
    description: [
      ''
    ]
  }
]

const useStepper = () => {

  return <>
  </>
}








// Notebook Description

const NotebookDescription = ( { metadata } ) => {
  if (metadata === null) return null
  return (
  <Acordion visibleContent='Details'
    hiddenContent={
      <Typography color="textSecondary">
        <Markdown children={metadata.description}/>
      </Typography>}
  />);
}


const Instructions = () => {
  const [ markdown, setMarkdown ] = useState('')

  useEffect(() => { 
    async function getHelp(){
      const response = await fetch("https://raw.githubusercontent.com/pollinations/pollinations/dev/docs/instructions.md");
      const md = await response.text();
      setMarkdown(md);
    }
    getHelp() 
  },[]);

  return <Markdown children={markdown}/>
}