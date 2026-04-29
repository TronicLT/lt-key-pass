# KeyPass

KeyPass is a secure, client-side, deterministic password generator designed to be hosted on GitHub Pages. Instead of remembering dozens of random passwords, you only need to remember one **Key Phrase** and a **Unique Salt** (like a website's domain name) to deterministically generate a strong, unique password for every service you use.

## Live Demo
You can view and use the live application here: [https://TronicLT.github.io/lt-key-pass/](https://TronicLT.github.io/lt-key-pass/)

## Features
- **Deterministic Generation**: Uses the browser's native Web Crypto API (`PBKDF2` with `SHA-256`) to ensure that the exact same phrase and salt combination will always yield the exact same secure byte array.
- **Customizable**: Control the length of your password and filter which character sets (uppercase, lowercase, numbers, symbols) are included.
- **Premium UI**: Built with modern aesthetics featuring a dark mode, glassmorphism panel, and dynamic background orbs.
- **100% Client-Side**: No servers, no tracking, and no saved passwords. The hashing happens entirely in your local browser, meaning your key phrase never leaves your device.

## Usage
1. Enter your master **Key Phrase**.
2. Enter a **Unique User Salt** (e.g., `github.com` or `banking-app`).
3. Adjust the desired length and character sets.
4. Click the copy button to copy the securely generated password to your clipboard.

## Local Development
Since this is built with vanilla HTML, CSS, and JS, no build step or package manager is required. 
Simply clone the repository and open `index.html` in your web browser.

```bash
git clone git@github.com:TronicLT/lt-key-pass.git
cd lt-key-pass
# Open index.html in your preferred browser
```

## Technologies
- HTML5
- CSS3 (Vanilla, CSS Variables, Flexbox/Grid, Glassmorphism)
- Vanilla JavaScript
- Web Crypto API (`crypto.subtle`)
