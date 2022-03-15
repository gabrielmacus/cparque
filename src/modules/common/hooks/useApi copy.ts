import axios from "axios";
//TODO: Get from .env
const sheetId = "1BPqSL0LEVwHJTcAS3NIKSC0R9LccoHlZ2E3YoirWLSw";
const key = "ya29.c.b0AXv0zTPIPIMxYWjxHKUFEZk5VvRe_QU6725MRLod20MT395U821nMHQYlli7WEcJohFsSjiZ6X1nCSmiqId123A6Ab1grsHeWGZLZ2IoXnhMPXaQmc6c9sdHjkDSWZxVSvM0RcDQ-DPcDNgJ8I0DRtOxF_auMVLv3jkujBVDRDuv-ljYCl0aOOPFrvloElHD9oksnAjEca65xUuUfRAk-tTVVUcLBg7N_Q.....................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................";
export interface ApiProps<T> {
    sheetName:string,
    objProps:string[]
    objToRow?:(data:T) => (string|number|undefined)[]
    rowToObj?:(row:(string|number)[]) => T
    generateId:(data:T) => string
}

export interface Api<T>
{
    list:() => Promise<T[]>
    add:(data:T) => any
    generateId:(data:T) => string
}

export default <T>(props:ApiProps<T>):Api<T> => {

    const objProps =props.objProps;

    const axiosInstance = axios.create({
        baseURL:`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`,
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`
        }
    });
    

    const rowsToObj = (rows:(string|number)[][]):T[] => {
        
        rows.shift();
        const formattedData: any[] = [];

        for(const row of rows)
        {
            let obj:any = {};
            if(props.rowToObj)
            {
                obj = props.rowToObj(row);
            }
            else
            {
                for(const index in objProps)
                {
                    obj[objProps[index]] = row[index];
                }  
            }
            
            formattedData.push(obj);
        }

        return formattedData as T[];
    };
    
    const objToRow = (obj:T):any[]=>{
        const rows:any[] = [];
        for(const key in obj)
        {
            rows.push(obj[key]);
        }
        return rows;
    }
    
    return {
        async list():Promise<T[]> {
            const response = await axiosInstance.get<{values:any[][]}>(props.sheetName);
            return rowsToObj(response.data.values);
        },
        async add(data:T) {
            const response = await axiosInstance.post(`${props.sheetName}:append?insertDataOption=INSERT_ROWS&includeValuesInResponse=true&valueInputOption=RAW&alt=json`,{
                values:[
                    props.objToRow ? props.objToRow(data) : objToRow(data)
                ]
            });
        },
        generateId:props.generateId
    }
};