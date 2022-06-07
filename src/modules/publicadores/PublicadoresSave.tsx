import { Form, Input, InputNumber, Select } from "antd";
import { useParams } from "react-router-dom";
import DataSave from "../common/components/DataSave";
import MainLayout from "../common/components/MainLayout";
import usePublicadoresApi, { Publicador } from "./usePublicadoresApi";

export default () => {
    const {id} = useParams();
    const publicadoresApi = usePublicadoresApi();

    return (
        <MainLayout title="Guardar publicador">
            <DataSave<Publicador,Publicador,Publicador>
                list={publicadoresApi.list}
                save={publicadoresApi.save}
                transformOnLoad={async (value) => value}
                transformOnSave={async (value) => value}
                id={id}
                successRoute={"/publicadores"}
                >
                    <Form.Item 
                    rules={[
                        {required:true,message:"Campo requerido"}
                    ]}
                    required 
                    name={"Nombre"} 
                    label="Nombre">
                        <Input  />
                    </Form.Item>
                    <Form.Item 
                    rules={[
                        {required:true,message:"Campo requerido"}
                    ]}
                    required
                    name={"Apellido"} 
                    label="Apellido">
                        <Input/>
                    </Form.Item>

                    <Form.Item 
                    rules={[
                        {required:true,message:"Campo requerido"}
                    ]}
                    required
                    name={"Grupo"} 
                    label="Grupo">
                        <Input />
                    </Form.Item>

                    <Form.Item 
                    rules={[
                        {len:10, message:"Debe tener un largo de 10 números"}
                    ]}
                    
                    name={"Celular"} 
                    label="Celular"
                    help={"Sin 0 y sin 15, ej: 3434123123"}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item 
                    
                    name={"Fijo"} 
                    label="Fijo"
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item   
                    rules={[
                        {required:true,message:"Elija una opción"}
                    ]}
                    required
                    name={"PrecursorTipo"} 
                    label="Tipo de publicador"
                    >
                        <Select>
                            <Select.Option value={"PUBLICADOR"}>
                                Publicador
                            </Select.Option>
                            <Select.Option value={"PRECURSOR_AUXILIAR"}>
                                Precursor auxiliar
                            </Select.Option>
                            <Select.Option value={"PRECURSOR_REGULAR"}>
                                Precursor regular
                            </Select.Option>
                            <Select.Option value={"PRECURSOR_ESPECIAL"}>
                                Precursor especial
                            </Select.Option>

                        </Select>
                    </Form.Item>

                    <Form.Item   
                    rules={[
                        {required:true,message:"Elija una opción"}
                    ]}
                    required
                    name={"ResponsabilidadTipo"} 
                    label="Tipo de responsabilidad"
                    >
                        <Select>
                            <Select.Option value={"PUBLICADOR"}>
                                Publicador
                            </Select.Option>
                            <Select.Option value={"SIERVO_MINISTERIAL"}>
                                Siervo ministerial
                            </Select.Option>
                            <Select.Option value={"ANCIANO"}>
                                Anciano
                            </Select.Option>
                        </Select>
                    </Form.Item>

            </DataSave>
        </MainLayout>
        );
};