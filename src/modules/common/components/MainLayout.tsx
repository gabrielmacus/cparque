import { Layout } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { useEffect, useState } from "react";
import styled from "styled-components";
/*
const Layout = styled.div`
`;

const LayoutBody = styled.div`
    padding:2rem;
`;
const LayoutHeader = styled.div`

background: @primary-color;
`;
const LayoutTitle = styled.h1`
padding-left: 2rem;
padding-right: 2rem;
padding-top: 1.5rem;
padding-bottom: 1.5rem;
`;*/
const StyledContent = styled(Content)`
padding:2rem;
`;

const StyledHeader = styled(Header)`
text-align:center;
color:white;
`;

interface MainLayoutProps {
    children:React.ReactNode,
    title?:string
}

export default (props:MainLayoutProps) => {


    return (
        <Layout>
            <StyledHeader>
                {props.title}
            </StyledHeader>
            <StyledContent>
                {props.children}
            </StyledContent>
        </Layout>
    );
};