import Cognito from "./cognito"

describe('COGNITO', ()=>{
    const cgn = new Cognito('sa-east-1_28VaLNwAP', '7joob4d238qo57i2gdmnkpava2')

    it('ADD USER', async()=>{
        await expect(cgn.addUser({ Email: 'mkufmld331@vigoneo.com', Nome: 'Robson Douglas' })).resolves.not.toThrow();
    })

})