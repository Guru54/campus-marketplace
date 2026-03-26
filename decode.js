const base64String = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const decoded = Buffer.from(base64String, "base64").toString("utf-8");
// decode ={"alg":"HS256","typ":"JWT"}

console.log(decoded);
const text = `{"alg":"NONE","typ":"JWT"}`;
const encoded = btoa(text);
console.log(encoded);