import { Button, Drawer, Layout } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Icon, { MenuOutlined } from "@ant-design/icons";

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
padding:0;
position:relative;
`;

const MenuButton = styled.div`
position: absolute;
left: 0;
color:white;
height:100%;
padding-left:1rem;
padding-right:1rem;
cursor:pointer;
`;

const MenuItem = styled.a`
display:block;
color:inherit;
padding:0.5rem 1rem 0.5rem 1rem;
font-weight: 600;
font-size:1.1rem;
&:first-child
{
    padding-top:1rem;
}
&:last-child
{
    padding-bottom:1rem;
}
`;

const MenuItems = styled.div`

`;


interface MainLayoutProps {
    children: React.ReactNode,
    title?: string,
    maxContentWidth?: number
}

export default (props: MainLayoutProps) => {
    const [drawerVisible, setDrawerVisible] = useState(false);

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    return (
        <Layout>
            <StyledHeader>
                <MenuButton onClick={openDrawer} ><MenuOutlined /></MenuButton>
                {props.title}
            </StyledHeader>
            <StyledContent>
                <div style={{ maxWidth: props.maxContentWidth ?? 1024, margin: 'auto' }}>
                    {props.children}
                </div>
            </StyledContent>
            <Drawer
                placement={"left"}
                closable={false}
                onClose={onCloseDrawer}
                bodyStyle={{ padding: 0, display: 'grid', flexGrow: 'inherit' }}
                visible={drawerVisible}

            >
                <MenuItems>
                    {/*
                    <MenuItem href="/">Ver asignaciones</MenuItem>
                    <MenuItem href="/#/asignaciones/guardar">Nueva asignación</MenuItem>*/}
                    <MenuItem href="/#/publicadores">Ver publicadores</MenuItem>
                    <MenuItem href="/#/publicadores/guardar">Nuevo publicador</MenuItem>
                    <MenuItem href="/#/programa">Programa</MenuItem>
                </MenuItems>
            </Drawer>
        </Layout>
    );
};