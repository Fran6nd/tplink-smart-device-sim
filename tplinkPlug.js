/**The class simulating the HS100, a basic smart-plug without monitoring capabilities. */
class TplinkHS100 extends require('./tplinkObj.js').TplinkObj
{
    constructor()
    {
        super();
        this.system.system.get_sysinfo.model = 'HS100';
        this.system.system.get_sysinfo.type = 'smartplug';
    }
}
new TplinkHS100().run();