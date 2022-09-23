import styled from "@emotion/styled"
import BannerIcon from '../assets/imgs/bannerIcon.svg'
import { MOBILE_BREAKPOINT } from "../styles/global"




export default function Banner(){


    return <Style>
        <img src={BannerIcon} alt="banner icon"/>
        <Item area='text'>
            <Headline>
                Integrate AI creation directly within your site or social media!
            </Headline>
            <SubHeadLine>
                We can tailor AI models for specific aesthetics.
            </SubHeadLine>
        </Item>
        <Item flex area='cta' >
            <LabelStyle>
                Get in touch at:
            </LabelStyle>
            <PillStyle>
                    <span> hello@pollinations.ai </span>
            </PillStyle>
        </Item>
</Style>
};


const Style = styled.div`
margin-top: 1em;
width: 100%;
min-height: 220px;
padding: 1em;
display: grid;
grid-template-columns: 1fr 5fr 2fr;
grid-template-rows: auto;
grid-template-areas: "icon text cta";

@media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    img {
        display: none;
    }
}

background: linear-gradient(90.41deg, rgba(255, 255, 255, 0.17) 1.53%, rgba(255, 255, 255, 0.1) 98.72%);
box-shadow: 0px 4px 24px -1px rgba(0, 0, 0, 0.17);
backdrop-filter: blur(15px);
/* Note: backdrop-filter has minimal browser support */
border-radius: 20px;

h2, h3, p {
    font-family: 'DM Sans';
    font-style: normal;
    font-weight: 400;
}
img {
    height: 156px;
    margin: auto 2em;
}
`

const Item = styled.div`
grid-area: ${props => props.area || 'item'};
align-self: center;
width: 100%;
${props => props.flex ? 'display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 1em;' : ''}

@media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
}
`

const Headline = styled.h2`
font-style: normal;
font-weight: 500;
font-size: 24px;
line-height: 40px;
color: #FFFFFF;
margin-bottom: 0.5em;
`

const SubHeadLine = styled.h2`
font-size: 20px;
line-height: 26px;
/* lime-bright */
color: #E9FA29;
margin-top: 0;
`

const LabelStyle = styled.p`
font-weight: 500;
font-size: 20px;
line-height: 26px;
color: #FFFFFF;
`
const PillStyle = styled.p`
font-size: 22px;
line-height: 29px;
color: #FFFFFF;
span {
font-style: italic;
border: 1px solid #E9FA29;
border-radius: 30px;
padding: 0.5em 1em;
}
`