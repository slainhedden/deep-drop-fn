import {createServer} from 'vite';
export async function withModel(callback) {
 const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom',logLevel:'error'});
 try {return await callback(path=>server.ssrLoadModule(path));}
 finally {await server.close();}
}
