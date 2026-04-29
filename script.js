const elements = {
    phrase: document.getElementById('phrase'),
    salt: document.getElementById('salt'),
    length: document.getElementById('length'),
    lengthVal: document.getElementById('length-val'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    output: document.getElementById('password-output'),
    copyBtn: document.getElementById('copy-btn'),
    feedback: document.getElementById('copy-feedback')
};

const charsets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    num: "0123456789",
    sym: "!@#$%^&*()_+~`|}{[]:;?><,./-="
};

// Event Listeners
[elements.phrase, elements.salt].forEach(el => {
    el.addEventListener('input', debounce(updatePassword, 300));
});

[elements.length, elements.uppercase, elements.lowercase, elements.numbers, elements.symbols].forEach(el => {
    el.addEventListener('input', () => {
        if (el === elements.length) {
            elements.lengthVal.textContent = el.value;
        }
        updatePassword();
    });
});

elements.copyBtn.addEventListener('click', async () => {
    if (!elements.output.value) return;
    try {
        await navigator.clipboard.writeText(elements.output.value);
        elements.feedback.classList.add('show');
        setTimeout(() => elements.feedback.classList.remove('show'), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});

// Logic
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function updatePassword() {
    const phrase = elements.phrase.value;
    const salt = elements.salt.value;
    const length = parseInt(elements.length.value);
    
    if (!phrase || !salt) {
        elements.output.value = "";
        return;
    }

    const useUpper = elements.uppercase.checked;
    const useLower = elements.lowercase.checked;
    const useNum = elements.numbers.checked;
    const useSym = elements.symbols.checked;

    if (!useUpper && !useLower && !useNum && !useSym) {
        elements.output.value = "Select at least one character type";
        return;
    }

    try {
        const password = await generatePassword(phrase, salt, length, useUpper, useLower, useNum, useSym);
        elements.output.value = password;
    } catch (error) {
        console.error("Error generating password:", error);
        elements.output.value = "Error generating password";
    }
}

async function generatePassword(phrase, salt, length, useUpper, useLower, useNum, useSym) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(phrase),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    // Derive enough bits: max of 256 or (length * 8 * 2) to be safe
    const deriveLen = Math.max(length * 16, 256);
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        deriveLen
    );

    const byteView = new Uint8Array(derivedBits);
    
    let activeCharset = "";
    const sets = [];
    if (useUpper) { activeCharset += charsets.upper; sets.push(charsets.upper); }
    if (useLower) { activeCharset += charsets.lower; sets.push(charsets.lower); }
    if (useNum) { activeCharset += charsets.num; sets.push(charsets.num); }
    if (useSym) { activeCharset += charsets.sym; sets.push(charsets.sym); }

    let password = "";
    let byteIndex = 0;
    
    // Ensure at least one char from each selected set
    for (let i = 0; i < sets.length; i++) {
        if (password.length < length) {
            const charSet = sets[i];
            const byte = byteView[byteIndex++];
            password += charSet[byte % charSet.length];
        }
    }

    // Fill the rest
    while (password.length < length) {
        if (byteIndex >= byteView.length) {
            // Unlikely to happen with the deriveLen formula, but just in case
            byteIndex = 0; 
        }
        const byte = byteView[byteIndex++];
        password += activeCharset[byte % activeCharset.length];
    }

    // Deterministically shuffle the password
    let pwdArray = password.split('');
    for (let i = pwdArray.length - 1; i > 0; i--) {
        if (byteIndex >= byteView.length) byteIndex = 0;
        const byte = byteView[byteIndex++];
        const j = byte % (i + 1);
        const temp = pwdArray[i];
        pwdArray[i] = pwdArray[j];
        pwdArray[j] = temp;
    }

    return pwdArray.join('');
}
