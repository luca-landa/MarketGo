"use strict";

const Socket = require('net').Socket;


class TcpClient {
    constructor(address, port, readyCallback, thisRef) {
        this.awaitingTcpResponses = {};
        this.client = new Socket();

        this.client.connect(port, address, (data) => {
            if(typeof readyCallback !== 'function') {
                return;
            }
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            }
            readyCallback.call(thisRef || this, data);
        });

        this.client.on('data', (data) => this.handleResponse.call(this, data));
    }

    handleResponse(data) {
        let messages = data.toString().split("\n");
        messages.splice(-1, 1); // remove last empty string

        messages.forEach((data) => {
            data = JSON.parse(data);

            let responseIdx = data.responseIdx;
            let message = data.message;

            if (!responseIdx) {
                return;
            }

            let callbackData = this.awaitingTcpResponses[responseIdx];
            if (callbackData) {
                callbackData.callback.call(callbackData.thisRef, message);
                delete this.awaitingTcpResponses[responseIdx]
            } else {
                console.log(`TCP: Received response for unregistered idx ${responseIdx}`);
            }
        });
    }

    sendAndRegisterCallback(msg, callback, thisRef) {
        let responseIdx = this.getRandomIdx();

        this.awaitingTcpResponses[responseIdx] = {
            callback: callback,
            thisRef: thisRef || this
        };

        let tcpMessage = JSON.stringify({
            responseIdx: responseIdx,
            message: msg
        });

        this.client.write(tcpMessage + "\n");
    }

    getRandomIdx() {
        return Math.floor(Math.random() * 1000000000);
    }
}

exports.TcpClient = TcpClient;