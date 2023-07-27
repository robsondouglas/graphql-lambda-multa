import { Infracao } from "./infracao"

describe('INFRACAO',()=>{
    const inf = new Infracao();
    it('get', async()=>{
        await expect(inf.get({ Id: '2332c599-00e9-4b22-a24e-2897f2c57479' })).resolves.not.toThrow();
    })

    it('list', async()=>{
        expect(inf.list()).resolves.toHaveLength(40);
    })
})