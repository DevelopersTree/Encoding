function encodeToUtf8(text, base) {
    let html = "";

    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        var charCode = char.codePointAt(0);
        let bytes = [];
        setBytesFromCharCode(charCode, bytes, 0, getBytesForCharCode(charCode))
        var bytesInHexa = "";

        for (let j = 0; j < bytes.length; j++) {
            bytesInHexa += bytes[j].toString(base);
            if (j != bytes.length - 1)
                bytesInHexa += " ";
        }

        let name = char;
        if (char in unprintableNames)
            name = unprintableNames[char];
        
        html += createSpan(bytesInHexa, name) + "\n";
    }

    return html;
}

function createSpan(content, tooltip) {
    return "<span class='cluster' data-toggle='tooltip' title='" + tooltip + "'>" + content + "</span>";
}

let unprintableNames = 
{
    "\x00" : "<null>",
    "\x01" : "<start of heading>",
    "\x02" : "<start of text>",
    "\x03" : "<end of text>",
    "\x04" : "<end of transmission>",
    "\x05" : "<enquiry>",
    "\x06" : "<acknowledge>",
    "\x07" : "<bell>",
    "\x08" : "<backpace>",
    "\x09" : "<horizontal tab>",
    "\x0A" : "<line feed, new line>",
    "\x0B" : "<vertical tab>",
    "\x0C" : "<form feed, new page>",
    "\x0D" : "<carriage return>",
    "\x0E" : "<shift out>",
    "\x0F" : "<shift in>",
    "\x10" : "<data link escape>",
    "\x11" : "<device control 1>",
    "\x12" : "<device control 2>",
    "\x13" : "<device control 3>",
    "\x14" : "<device control 4>",
    "\x15" : "<negative acknowledge>",
    "\x16" : "<synchonous idle>",
    "\x17" : "<end of transmission block>",
    "\x18" : "<cancel>",
    "\x19" : "<end of medium>",
    "\x1A" : "<substitute>",
    "\x1B" : "<escape>",
    "\x1C" : "<file separator>",
    "\x1D" : "<group separator>",
    "\x1E" : "<record separator>",
    "\x1F" : "<unit separator>",
    "\x20" : "<space>",
    "\x7F" : "<delete"
}

// From: https://stackoverflow.com/a/19606031/7003797
// Authors: Ryan (https://stackoverflow.com/u/1133577) and 
//          Stefan Rein (https://stackoverflow.com/u/4641479)
// License: Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)

function getEndianness() {
    var arrayBuffer = new ArrayBuffer(2);
    var uint8Array = new Uint8Array(arrayBuffer);
    var uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xAA; // set first byte
    uint8Array[1] = 0xBB; // set second byte
    if(uint16array[0] === 0xBBAA) return "LE";
    if(uint16array[0] === 0xAABB) return "BE";
    else throw new Error("Something crazy just happened");
}

// UTF8 encoding functions
// From: https://github.com/nfroidure/utf-8
// Author: Nicolas Froidure (https://github.com/nfroidure)
// License: MIT

function getBytesForCharCode(charCode) {
    if (charCode < 128) {
      return 1;
    } else if (charCode < 2048) {
      return 2;
    } else if (charCode < 65536) {
      return 3;
    } else if (charCode < 2097152) {
      return 4;
    }
    throw new Error('CharCode ' + charCode + ' cannot be encoded with UTF8.');
  }
  

function setBytesFromCharCode(charCode, bytes, byteOffset, neededBytes) {
    charCode = charCode | 0;
    bytes = bytes || [];
    byteOffset = byteOffset | 0;
    neededBytes = neededBytes || getBytesForCharCode(charCode);
    // Setting the charCode as it to bytes if the byte length is 1
    if (1 == neededBytes) {
        bytes[byteOffset] = charCode;
    } else {
        // Computing the first byte
        bytes[byteOffset++] =
            (parseInt('1111'.slice(0, neededBytes), 2) << (8 - neededBytes)) +
            (charCode >>> (--neededBytes * 6));
        // Computing next bytes
        for (; neededBytes > 0;) {
            bytes[byteOffset++] = ((charCode >>> (--neededBytes * 6)) & 0x3f) | 0x80;
        }
    }
    return bytes;
}

function setBytesFromString(string, bytes, byteOffset, byteLength, strict) {
    string = string || '';
    bytes = bytes || [];
    byteOffset = byteOffset | 0;
    byteLength =
        'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
    for (var i = 0, j = string.length; i < j; i++) {
        var neededBytes = getBytesForCharCode(string[i].codePointAt(0));
        if (strict && byteOffset + neededBytes > byteLength) {
            throw new Error(
                'Not enought bytes to encode the char "' +
                string[i] +
                '" at the offset "' +
                byteOffset +
                '".'
            );
        }
        setBytesFromCharCode(
            string[i].codePointAt(0),
            bytes,
            byteOffset,
            neededBytes,
            strict
        );
        byteOffset += neededBytes;
    }
    return bytes;
}