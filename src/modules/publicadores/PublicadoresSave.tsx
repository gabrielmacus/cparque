import { Form, Input } from "antd";
import DataSave from "../common/components/DataSave";
import MainLayout from "../common/components/MainLayout";
import usePublicadoresApi, { Publicador } from "./usePublicadoresApi";

export default () => {
    const publicadoresApi = usePublicadoresApi();

    return (
        <MainLayout title="Guardar publicador">
            <DataSave<Publicador,Publicador,Publicador>
                list={publicadoresApi.list}
                save={publicadoresApi.save}
                transformOnLoad={async (value) => value}
                transformOnSave={async (value) => value}
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
            </DataSave>
        </MainLayout>
        );
};