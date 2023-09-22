import { Checkbox, Form, Input, Switch, Table } from "antd";
import { FilterValue } from "antd/lib/table/interface";
import { useEffect, useState } from "react";
import DataFilter from "../common/components/DataFilter";
import DataTable from "../common/components/DataTable";
import EditableCell from "../common/components/EditableCell";
import MainLayout from "../common/components/MainLayout";
import { ActionResult } from "../common/hooks/useApi";
import usePublicadoresApi, { Publicador } from "./usePublicadoresApi";


export default () => {
    const api = usePublicadoresApi();
    const createPage = "/publicadores/guardar"
    const editPage = "/publicadores/guardar/{Id}"

    const [nombreFilterForm] = Form.useForm();
    const [apellidoFilterForm] = Form.useForm();
    const [grupoFilterForm] = Form.useForm();
    const [celularFilterForm] = Form.useForm();

    const generateFilters = (filters:Record<string, FilterValue | null>) => {
        console.log(filters)
        return [
            filters?.Nombre != null ?  `contains(Nombre,'${filters!.Nombre![0]}')` : "",
            filters?.Apellido != null ?  `contains(Apellido,'${filters!.Apellido![0]!}')` : "",
            filters?.Celular != null && filters!.Celular![0] == true ?  `(Celular eq '' or Celular eq null)` : "",
            filters?.Grupo != null ?  `Grupo eq '${filters!.Grupo![0]!}'` : "",
            filters?.Fijo != null ?  `Fijo eq '${filters!.Fijo![0]!}'` : "",
            
        ];
    }


    useEffect(()=>{
        
    },[]);

    return (
        <MainLayout title="Listado de publicadores">
            <DataTable<Publicador,Publicador>
            list={api.list}
            delete={api.delete}
            createAction={{
                label:"Agregar publicador",
                path:createPage
            }}
            deleteMultipleAction
            defaultSortOrder={"Apellido desc"}
            selectionType='checkbox'
            title={"Publicadores"}
            generateFilters={generateFilters}
            editItemAction={editPage}
            deleteItemAction
            deleteItemActionConfirmMessage={(item) => `¿Eliminar a ${item.Apellido} ${item.Nombre}?`}
            defaultPageSize={25}
            
            >


                <Table.Column<Publicador>
                    width={`25%`}
                    title="Apellido"
                    dataIndex={"Apellido"}
                    sorter
                    render={(val, record)=>
                        <EditableCell<Partial<Publicador>>
                            save={api.save}
                            id={record.Id}
                            render={(value)=>value.Apellido!}
                            formValue={{Apellido:val}}
                            formItem={<Form.Item style={{marginBottom:0}} name={"Apellido"} ><Input maxLength={150} /></Form.Item>}
                            value={record} />
                    }
                    defaultSortOrder={'descend'}
                    sortDirections={["ascend","descend","ascend"]}
                    filterDropdown={(props)=>{
                        return (
                            <DataFilter filterDropdownProps={props} form={apellidoFilterForm} >
                                <Form.Item name={"Apellido"} style={{marginBottom:10}}>
                                    <Input placeholder='Apellido...'></Input>
                                </Form.Item>
                            </DataFilter>
                        );
                    }
                   }
                   
                />

                <Table.Column<Publicador>
                    width={`25%`}
                    title="Nombre"
                    dataIndex={"Nombre"}
                    sorter
                    render={(val, record)=>
                        <EditableCell<Partial<Publicador>>
                            save={api.save}
                            id={record.Id}
                            render={(value)=>value.Nombre!}
                            formValue={{Nombre:val}}
                            formItem={<Form.Item style={{marginBottom:0}} name={"Nombre"} ><Input maxLength={150} /></Form.Item>}
                            value={record} />
                    }
                    sortDirections={["ascend","descend","ascend"]}
                    filterDropdown={(props)=>{
                        return (
                            <DataFilter filterDropdownProps={props} form={nombreFilterForm} >
                                <Form.Item name={"Nombre"} style={{marginBottom:10}}>
                                    <Input placeholder='Nombre...'></Input>
                                </Form.Item>
                            </DataFilter>
                        );
                    }
                   }
                   
                />

                
                <Table.Column<Publicador>
                    
                    width={`20%`}
                    title="Celular"
                    dataIndex={"Celular"}
                    filterDropdown={(props)=>{
                        return (
                            <DataFilter filterDropdownProps={props} form={celularFilterForm} >
                                <Form.Item valuePropName="checked" name={"SinCelular"}  >
                                     <Checkbox  >Sin celular</Checkbox>
                                       {/*<Input placeholder='Nombre...'></Input>*/}
                                </Form.Item>
                            </DataFilter>
                        );
                    }}
                    
                    render={(val, record)=>
                        <EditableCell<Partial<Publicador>>
                            save={api.save}
                            id={record.Id}
                            render={(value)=>value.Celular!}
                            formValue={{Celular:val}}
                            formItem={<Form.Item style={{marginBottom:0}} name={"Celular"} ><Input maxLength={150} /></Form.Item>}
                            value={record} />
                    }
                   
                />  

                <Table.Column<Publicador>
                    width={`20%`}
                    title="Fijo"
                    dataIndex={"Fijo"}
                    render={(val, record)=>
                        <EditableCell<Partial<Publicador>>
                            save={api.save}
                            id={record.Id}
                            render={(value)=>value.Fijo!}
                            formValue={{Fijo:val}}
                            formItem={<Form.Item style={{marginBottom:0}} name={"Fijo"} ><Input maxLength={150} /></Form.Item>}
                            value={record} />
                    }
                   
                />  

                
                <Table.Column
                    filterDropdown={(props)=>{
                        return (
                            <DataFilter filterDropdownProps={props} form={grupoFilterForm} >
                                <Form.Item name={"Grupo"} style={{marginBottom:10}}>
                                    <Input placeholder='Grupo...'></Input>
                                </Form.Item>
                            </DataFilter>
                        );
                    }}
                    width={`10%`}
                    title="Grupo"
                    dataIndex={"Grupo"}
                   
                />  




            </DataTable>
        </MainLayout>
    );

};