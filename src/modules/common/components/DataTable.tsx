import { Form, message, TablePaginationConfig, FormInstance, Table, Typography, Button, Input, Space, Dropdown, Menu, Modal } from "antd";
import { FilterValue, SorterResult, FilterDropdownProps, ColumnsType, TableRowSelection } from "antd/lib/table/interface";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { JsxFragment } from "typescript";
//import BaseAPI, { ActionResult, BaseListModel, Query } from "../BaseAPI";

import { SearchOutlined } from '@ant-design/icons';
import { DownOutlined, DeleteFilled,EditOutlined,DeleteOutlined,UserOutlined,PlusOutlined } from '@ant-design/icons';
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ActionResult, Model, Query } from "../hooks/useApi";

export interface DataAction<TModel extends Model>
{
    key:string
    label:string | ((selectedItems:TModel[]) => string)
    icon?:React.ReactNode,
    checkDisabled?:(selectedItems:TModel[])=>boolean,
    labelType?:('danger'|'secondary'|'success'|'warning')
};

export interface DataItemAction<TModel extends Model> extends DataAction<TModel>
{
    action:(item:TModel,selectedItems:TModel[])=>any
}

export interface DataTableAction<TModel extends Model> extends DataAction<TModel>
{
    action:(selectedItems:TModel[])=>any
};

export interface DataTableProps <TModel extends Model,TSaveModel extends Partial<Model>>  {
    generateFilters: (filters:Record<string, FilterValue | null>) => any[]
    //columns?: ColumnsType<TModel>
    children:JSX.Element[] | JSX.Element,
    title:string
    defaultPageSize?:number
    onRowSelectionChanged?:(items:TModel[]) => any
    selectionType?:('radio'|'checkbox')
    selectedIds?:number[]
    tableActions?: DataTableAction<TModel>[]
    itemActions?:DataItemAction<TModel>[]
    createAction?:{label:string, path:string}
    idColumn?:boolean,
    deleteMultipleAction?:boolean
    deleteItemAction?:boolean,
    deleteItemActionConfirmMessage?:(data:TModel) => string,
    editItemAction?:string,
    $expand?:string[],

    defaultSortOrder?:string

    list:(query:Query) => Promise<ActionResult<TModel[]>>
    delete:(id:number) => Promise<ActionResult<any>>
};

const TableFooter = styled.div`
display: flex;
justify-content: space-between;
`;

const DataTable= <TModel extends Model,TSaveModel extends Partial<Model>>(props:DataTableProps<TModel,TSaveModel>) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ActionResult<TModel[]>>();
    const [query, setQuery] = useState<Query>({
        $top:props.defaultPageSize ?? 20,
        $count:true,
        $skip:0,
        $filter:[],
        $orderby:props.defaultSortOrder ? [props.defaultSortOrder]:[],
        //FIX: Agregada la posibilidad de usar $expand en tabla
        $expand:props.$expand ?? []
    });
    const [selectedIds, setSelectedIds] = useState<number[]>(props.selectedIds ?? []);


    const loadItems = async (newQuery?:Query) => {
        setLoading(true);

        const res = await props.list(newQuery ?? query);
        
        setQuery(newQuery ?? query);

        setResult(res);
        if(res?.error)
        {
            message.error("Error al leer los datos");
        }

        setLoading(false);

    };

    const handleTableChange =  (pagination:TablePaginationConfig, filters:Record<string, FilterValue | null>, sorter:SorterResult<TModel> | SorterResult<TModel>[]) => { 
        if(pagination.pageSize != query.$top)
        {
            pagination.current = 1;
        }

        props.onRowSelectionChanged?.([]);
        setSelectedIds([]);

        loadItems({...query,...{
            $skip: query.$top! * ((pagination.current  ?? 1 )- 1),
            $top: pagination.pageSize,
            $orderby: Array.isArray(sorter) ? sorter.map(sorter => `${sorter.field} ${sorter.order == 'ascend' ? "asc" :"desc"}`) :  [ sorter.field ? `${sorter.field} ${sorter.order == 'ascend' ? "asc" :"desc"}` : ``].filter(f => f!="" && f!= null),
            $filter:props.generateFilters(filters).filter(f => f != "" && f != null)
        }});
    };

    const getSelectedItems = () => {
        return result?.data?.value.filter( i => selectedIds.includes(i.Id) ) ?? [];
    };

    const deleteMultipleItems = async (items:TModel[]) => {
        for(const item of items)
        {
            try {
                await props.delete(item.Id)
            } catch (error) {
                let msg = axios.isAxiosError(error) && error.code == "401" ? "No tiene permiso para eliminar" : "Error al eliminar un elemento";
                message.error(msg);
                break;
            }
        }
        await loadItems();
    };

    const rowSelection:TableRowSelection<TModel> | undefined = props.selectionType ? {
        type:props.selectionType,
        onChange: (selectedRowKeys: React.Key[], selectedRows: TModel[]) => {
            props.onRowSelectionChanged?.(selectedRows);
            setSelectedIds(selectedRowKeys.map(k => parseInt(k.toString())));
        },
        selectedRowKeys:selectedIds
    } : undefined;
    
    const ItemActions = (item:TModel)=>{
        return props.itemActions ? (
            <Dropdown trigger={['click']} arrow overlay={<Menu >
                {props.itemActions.map(action => 
                    <Menu.Item 
                        
                        disabled={action?.checkDisabled?.(getSelectedItems())} 
                        onClick={()=>action.action(item,getSelectedItems())} 
                        key={action.key} 
                        icon={action.icon}>
                        <Typography.Text type={action.labelType}>{typeof action.label == "string" && action.label}</Typography.Text>
                        <Typography.Text type={action.labelType}>{typeof action.label == "function" && action.label(getSelectedItems())}</Typography.Text>
                    </Menu.Item>)} 
                    </Menu>}>
            <Button type="link">
            Acciones <DownOutlined />
            </Button>
        </Dropdown>
        ) : undefined;
    };

    const getItemActions = ():DataItemAction<TModel>[] => {
        const actions = [...(props.itemActions ?? [])];
        if(props.editItemAction)
        {
            actions.push({
                action:(item,selectedItems)=>navigate(props.editItemAction!.replace("{Id}",item.Id.toString())),
                key:`edit`,
                label:"Editar",
                icon:<EditOutlined/>
                
            });
        }
        if(props.deleteItemAction)
        {
            actions.push({
                action:(item,selectedItems)=>{
                    Modal.confirm({
                        title:props.deleteItemActionConfirmMessage ? props.deleteItemActionConfirmMessage(item):`¿Eliminar item?`,
                        onOk:async ()=> {
                            await props.delete(item.Id);
                            await loadItems();
                        },
                        okText:"Si",
                        cancelText:"No",
                        width:350
                    })
                },
                key:`delete`,
                label:"Eliminar",
                icon:<DeleteOutlined/>
                
            });
        }

        return actions;
        
    };

    const Footer = ()=>{

        const tableActions = props.tableActions ??  [];
        if(props.deleteMultipleAction)
        {
            tableActions.push({
                label:(selectedItems)=>`Eliminar (${selectedItems.length})`,
                action:(selectedItems)=>Modal.confirm({
                    onOk:()=>deleteMultipleItems(selectedItems),
                    okText:"Aceptar",
                    cancelText:"Cancelar",
                    title:`¿Eliminar ${selectedItems.length} ${selectedItems.length > 1 ? 'elementos':'elemento'}?`,
                    width:350
                }),
                labelType:'danger',
                checkDisabled:(selectedItems) => selectedItems.length == 0,
                key:'delete_'+(tableActions.length + 1),
                icon:<DeleteOutlined/>
            }); 
        }

        return (
            <TableFooter >
                {tableActions?.length > 0 && 
                <Dropdown trigger={['click']} arrow overlay={<Menu >
                                        {tableActions.map(action => 
                                            <Menu.Item 
                                                
                                                disabled={action?.checkDisabled?.(getSelectedItems())} 
                                                onClick={()=>action.action(getSelectedItems())} 
                                                key={action.key} 
                                                icon={action.icon}>
                                                <Typography.Text type={action.labelType}>{typeof action.label == "string" && action.label}</Typography.Text>
                                                <Typography.Text type={action.labelType}>{typeof action.label == "function" && action.label(getSelectedItems())}</Typography.Text>
                                            </Menu.Item>)} 
                                    </Menu>}>
                    <Button type="primary">
                        Acciones <DownOutlined />
                    </Button>
                </Dropdown>
                }

                {props.createAction && <Button icon={<PlusOutlined/>}  type={"link"} onClick={()=>navigate(props.createAction!.path)}>{props.createAction.label}</Button>}


            </TableFooter>
            
        );
    };

    useEffect(()=>{
        loadItems();
    },[]);

    return (
        <>
        <Table
                locale={{
                    emptyText:"Sin datos",
                    
                
                }}
                rowSelection={rowSelection}
                title={()=><Typography.Title level={4}  >{props.title}</Typography.Title>}
                bordered
                //columns={props.columns}
                rowKey={"Id"}
                dataSource={result?.data?.value ?? []}
                pagination={{
                    hideOnSinglePage:true,
                    current: query.$skip! > 0 ? (query.$skip! / query.$top!) + 1 : 1,
                    pageSize:query.$top!,
                    total:result?.data?.['@odata.count'] ?? 0
                }}
                loading={loading}
                onChange={handleTableChange}
                footer={()=><Footer/>}

        >
            {props.idColumn && 
            <Table.Column
                title="Id"
                dataIndex={"Id"}
                sorter
                width={"15%"}
                sortDirections={["ascend","descend","ascend"]}
            />}
            {props.children} 
             
            {getItemActions().length &&
            <Table.Column<TModel> 
            width={"0"}   
            render={(value,record,index)=>{
                    return (
                        <Dropdown trigger={['click']} arrow overlay={<Menu >
                            {getItemActions().map(action => 
                                <Menu.Item 
                                    
                                    disabled={action?.checkDisabled?.(getSelectedItems())} 
                                    onClick={()=>action.action(record,getSelectedItems())} 
                                    key={action.key+'-'+index} 
                                    icon={action.icon}>
                                    <Typography.Text type={action.labelType}>{typeof action.label == "string" && action.label}</Typography.Text>
                                    <Typography.Text type={action.labelType}>{typeof action.label == "function" && action.label(getSelectedItems())}</Typography.Text>
                                </Menu.Item>)} 
                                </Menu>}>
                        <Button type="link">
                        Acciones <DownOutlined />
                        </Button>
                    </Dropdown>
                    );
            }} />
            }
        </Table>
        </>
    );
};


export default DataTable;

