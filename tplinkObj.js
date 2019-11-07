/**
 * Full protocole description here:
 * https://github.com/softScheck/tplink-smartplug/blob/master/tplink-smarthome-commands.txt */


class TplinkObj {
    constructor() {
        this.system = JSON.parse('{"system":{"get_sysinfo":{"err_code":0,"sw_ver":"1.0.8 Build 151101 Rel.24452","hw_ver":"1.0","type":"smartplug","model":"HS130(EU)","mac":"50:C7:BF:00:C4:D0","deviceId":"8006BE9B2C1A6114DBFA0632B02D566D170BC38A","hwId":"22603EA5E716DEAEA6642A30BE87AFCA","fwId":"BFF24826FBC561803E49379DBE74FD71","oemId":"812A90EB2FCF306A993FAD8748024B07","alias":"mio","dev_name":"Wi-Fi Smart Plug","icon_hash":"","relay_state":0,"on_time":0,"active_mode":"schedule","feature":"TIM","updating":0,"rssi":-52,"led_off":0,"latitude":0,"longitude":0}},"emeter":{"err_code":-1,"err_msg":"module not support"}}');
        this.packetManagers = [];
        this.addPacketManager((server, pkt, rinfo) => {
            if(pkt.system.get_sysinfo)
            {
                console.log('Successfully discovered by ', rinfo.address);
                server.send(this.encrypt(JSON.stringify(this.system)), rinfo.port, rinfo.address);
                return true;
            }
        });
        this.addPacketManager((server, pkt, rinfo) => {
            if(pkt.system.set_relay_state)
            {
                this.system.system.get_sysinfo.relay_state = pkt.system.set_relay_state.state;
                console.log('Value changed to: ', pkt.system.set_relay_state.state);
                server.send(this.encrypt(JSON.stringify(this.system)), rinfo.port, rinfo.address);
                return true;
            }
        });
    }
    encrypt(input, firstKey = 0xAB) {
        const buf = Buffer.from(input);
        let key = firstKey;
        for (let i = 0; i < buf.length; i++) {
            buf[i] = buf[i] ^ key;
            key = buf[i];
        }
        return buf;
    }
    decrypt(input, firstKey = 0xAB) {
        const buf = Buffer.from(input);
        let key = firstKey;
        let nextKey;
        for (let i = 0; i < buf.length; i++) {
            nextKey = buf[i];
            buf[i] = buf[i] ^ key;
            key = nextKey;
        }
        return buf;
    }
    managePacket(server, pkt, rinfo) {
        for (var obj in this.packetManagers) {
            /** Each packet manager should return true if he managed the packet. */
            if(this.packetManagers[obj](server, pkt, rinfo) === true)
            {
                return;
            }
        }
        console.error('Unmanaged packet: ', pkt);
    }
    addPacketManager(p) {
        this.packetManagers.push(p);
    }
    run() {
        var dgram = require('dgram');
        var server = dgram.createSocket("udp4");
        server.bind(9999);
        var tplink = this;
        server.on("message", function (message, rinfo) {
            tplink.managePacket(server, JSON.parse(tplink.decrypt(message).toString()), rinfo);
            });

        // When udp server started and listening.
        server.on('listening', function () {
            // Get and print udp server listening ip address and port number in log console. 
            var address = server.address();
            console.log('Simulator started and listening on ' + address.address + ":" + address.port);
        });

    }
}
module.exports.TplinkObj = TplinkObj;