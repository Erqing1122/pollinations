import styled from '@emotion/styled';
import LinearProgress from '@material-ui/core/LinearProgress';
import React, { useEffect } from "react";
import Form from './Form';
import useAWSNode from '@pollinations/ipfs/reactHooks/useAWSNode';
import { GlobalSidePadding, MOBILE_BREAKPOINT } from '../../styles/global';
import { SEOMetadata } from '../../components/Helmet';
 
import Previewer from './Previewer';
import { useNavigate, useParams } from 'react-router-dom';
import { MODELS_MAP } from '../../assets/GPUModels';
import { Button, CircularProgress } from '@material-ui/core';

import Debug from 'debug';
import Examples from '../../components/organisms/Examples';
import { IpfsLog } from '../../components/Logs';
import { NotebookProgress } from '../../components/NotebookProgress';
import { FailureViewer } from '../../components/FailureViewer';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getPollens } from '@pollinations/ipfs/awsPollenRunner';
import { useIsAdmin } from '../../hooks/useIsAdmin';



const debug = Debug("pages/Create/index");

const IS_FORM_FULLWIDTH = true;

export default React.memo(function Create() {
    // :id and :model from url
    const params = useParams();
    const { Model } = params;


    // aws stuff
    const { submitToAWS, ipfs, isLoading, setNodeID, updatePollen } = useAWSNode(params);

    // current model, should move to url
    const [ selectedModel, setSelectedModel ] = React.useState({ key: '', url: '' });

    const [isAdmin, _] = useLocalStorage('isAdmin', false);

    debug("selected model", selectedModel);
    
    const navigateTo = useNavigate();

    useRandomPollen(params.nodeID, selectedModel, setNodeID);

    // set selected model with DropDown
    const onSelectModel = e => setSelectedModel({
        url:  e.target.value,
        key: e.target.value
    })

    // set selected model with URL :id
    useEffect(()=>{
        if (!MODELS_MAP[Model]) return;
        setSelectedModel({
            ...MODELS_MAP[Model],
            url: MODELS_MAP[Model]?.key,
        });
    },[Model]);


    // dispatch to AWS
    const dispatch = async (values) => {
        console.log(values, selectedModel.url)
        values = {...values, caching_seed: Math.floor(Math.random() * 1000)};
        const { nodeID } = await submitToAWS(values, selectedModel.url, false);
        if (!Model) {
            navigateTo(`/create/${nodeID}`);
        } else {
            navigateTo(`/create/${Model}/${nodeID}`);
        }
    }

    
    return <PageLayout >
        <SEOMetadata title={selectedModel.url ?? 'OwnGpuPage'} />
        <ParametersArea>
            <FlexBetween>
            <h2>
                {selectedModel.name}
            </h2>
            { isLoading && <CircularProgress thickness={2} size={20} /> }
            </FlexBetween>
            { isLoading && <NotebookProgress output={ipfs?.output} /> }
            {/* { isLoading && <LinearProgress style={{margin: '1.5em 0'}} /> } */}
            
            <Form 
                ipfs={ipfs}
                hasSelect={!Model}
                isDisabled={isLoading} 
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                onSubmit={async (values) => dispatch(values) } 
                Results={
                <ResultsArea>
                    { ipfs?.output?.success === false && <FailureViewer ipfs={ipfs} contentID={ipfs[".cid"]}/>}
                    <Button variant="contained" color="primary" onClick={() => updatePollen({example: true})}>
                        Add to Examples
                    </Button>
                    <Previewer ipfs={ipfs}  /> 
                </ResultsArea>
                }
            />
            
        </ParametersArea>

        { isAdmin && ipfs && <IpfsLog ipfs={ipfs} contentID={ipfs[".cid"]} /> }
    
    </PageLayout>
});



// STYLES
const PageLayout = styled.div`
padding: ${GlobalSidePadding};
width: 100%;
margin-top: 1em;
min-height: 80vh;

background: radial-gradient(43.05% 43.05% at 50% 56.95%, #2F3039 0%, #000000 100%);
`;

const ParametersArea = styled.div`
width: 100%;

`
const ResultsArea = styled.div`
width: 70%;
// max-width: 100%;
@media (max-width: ${MOBILE_BREAKPOINT}) {
  width: 100%;
  max-width: 100%;
}
`

function useRandomPollen(nodeID, selectedModel, setNodeID) {
    const [isAdmin,_] = useIsAdmin();
    debug("isAdmin", isAdmin);
    useEffect(() => {
        if (!nodeID && selectedModel.key) {
            (async () => {
                debug("getting pollens for model", selectedModel.key);
                const pollens = await getPollens({ image: selectedModel.key, success: true, example: isAdmin ? false : true});
                
                if (pollens.length > 0) {
                    // select random pollen
                    const { input } = pollens[Math.floor(Math.random() * pollens.length)];
                    setNodeID(input);
                }
            })();
        }
    }, [nodeID, selectedModel]);


}

function parseURL(url){
    const [ , ...parts ] = url.split('/');
    return parts.join('/');
}

const FlexBetween = styled.div`
display: flex;
flex-direction: row;
// justify-content: space-between;
align-items: center;
gap: 1em;
`