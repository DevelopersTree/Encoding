function encodeInUtf8(text, base, _) {
    let html = "";

    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        let charCode = char.codePointAt(0);
        let bytes = [];
        setBytesFromCharCode(charCode, bytes, 0, getBytesForCharCode(charCode))

        html += formatCharacter(char, bytes, base);
    }

    return html;
}

function encodeInUtf16(text, base, littleEndian) {
    let html = "";
    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        
        console.log(text.codePointAt(i).toString(16))
        let bytes = codePointToUtf16(text.codePointAt(i), littleEndian);

        html += formatCharacter(char, bytes, base);

        if (text.codePointAt(i) != char.codePointAt(0))
            i ++; // Skip low surrogate character
    }

    return html;
}

function encodeInUtf32(text, base, littleEndian) {
    let html = "";
    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        let bytes = codePointToUtf32(text.codePointAt(i), littleEndian, 4);

        html += formatCharacter(char, bytes, base);
    }

    return html;
}

// https://en.wikipedia.org/wiki/UTF-16
function codePointToUtf16(codePoint, littleEndian) {
    if (codePoint < 0xD7FF || (codePoint >= 0xE000 && codePoint <= 0xFFFF)) {
        return codePointToUtf32(codePoint, littleEndian, 2);
    } else if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        return [codePoint];
    } else if (codePoint >= 0x10000 && codePoint <= 0x10FFFF) {
        codePoint -= 0x10000;
        let highSurrogate = Math.floor(codePoint / 0x400) + 0xD800;
        let lowSurrogate = (codePoint % 0x400) + 0xDC00;
        let byte1 = Math.floor(highSurrogate / 0x100);
        let byte2 = highSurrogate % 0x100;
        let byte3 = Math.floor(lowSurrogate / 0x100);
        let byte4 = lowSurrogate % 0x100;

        if (littleEndian) {
            return [byte2, byte1, byte4, byte3]
        } else {
            return [byte1, byte2, byte3, byte4];
        }
    }

    throw new RangeError("codePoint must be between 0x0 and 0x10FFFF");
}

function codePointToUtf32(number, littleEndian, padTo) {
    let digits = [];
    while (number > 0) {
        let remainder = number % 16;
        number = Math.floor(number / 16);

        digits.push(remainder);
    }

    if (digits.length % 2 != 0) {
        digits.push(0);
    }

    let bytes = [];
    for (let i = digits.length - 1; i >= 0; i -= 2) {
        let currentDigits = [];

        if (i == 0) {
            currentDigits.push(0);
            currentDigits.push(toHexDigit(digits[i]));
        } else {
            currentDigits.push(toHexDigit(digits[i]));
            currentDigits.push(toHexDigit(digits[i - 1]));
        }

        let hex = currentDigits.join('');
        let number = parseInt(hex, 16);
        bytes.push(number);
    }

    for (let j = bytes.length; j < padTo; j++) {
        bytes.unshift(0);
    }

    if (littleEndian)
        return bytes.reverse();

    return bytes;
}

function toHexDigit(decimal) {
    if (decimal < 10)
        return decimal;

    let hexDigits = ['A', 'B', 'C', 'D', 'E', 'F'];
    return hexDigits[decimal - 10];
}

function formatCharacter(char, bytes, base) {
    var bytesInHexa = "";

    for (let j = 0; j < bytes.length; j++) {
        bytesInHexa += bytes[j].toString(base);
        if (j != bytes.length - 1)
            bytesInHexa += " ";
    }

    let name = char;
    if (char in unprintableNames)
        name = unprintableNames[char];

    return createSpan(bytesInHexa, name) + "\n";
}

function createSpan(content, tooltip) {
    return "<span class='cluster' data-toggle='tooltip' title='" + tooltip + "'>" + content + "</span>";
}

let unprintableNames = {
    "\x00": "<null>",
    "\x01": "<start of heading>",
    "\x02": "<start of text>",
    "\x03": "<end of text>",
    "\x04": "<end of transmission>",
    "\x05": "<enquiry>",
    "\x06": "<acknowledge>",
    "\x07": "<bell>",
    "\x08": "<backpace>",
    "\x09": "<horizontal tab>",
    "\x0A": "<line feed, new line>",
    "\x0B": "<vertical tab>",
    "\x0C": "<form feed, new page>",
    "\x0D": "<carriage return>",
    "\x0E": "<shift out>",
    "\x0F": "<shift in>",
    "\x10": "<data link escape>",
    "\x11": "<device control 1>",
    "\x12": "<device control 2>",
    "\x13": "<device control 3>",
    "\x14": "<device control 4>",
    "\x15": "<negative acknowledge>",
    "\x16": "<synchonous idle>",
    "\x17": "<end of transmission block>",
    "\x18": "<cancel>",
    "\x19": "<end of medium>",
    "\x1A": "<substitute>",
    "\x1B": "<escape>",
    "\x1C": "<file separator>",
    "\x1D": "<group separator>",
    "\x1E": "<record separator>",
    "\x1F": "<unit separator>",
    "\x20": "<space>",
    "\x7F": "<delete"
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